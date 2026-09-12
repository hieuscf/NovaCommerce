import { Result } from '@novacommerce/building-blocks';
import type { IProductRepository } from '../../../catalog/domain/repositories/i-product-repository';
import type { ICreateOrderFromCheckoutService } from '../../../order/application/contracts/create-order-from-checkout.contract';
import type { IPaymentInitiationService } from '../../../payment/application/contracts/payment-initiation.contract';
import { isPaymentProvider } from '../../../payment/application/contracts/payment-provider.contract';
import type { IUserRepository } from '../../../user/domain/repositories/i-user-repository';
import type { ICheckoutSessionRepository } from '../../domain/repositories/i-checkout-session-repository';
import { CheckoutStatus } from '../../domain/aggregates/checkout-session';
import type { CompleteCheckoutResponseDto } from '../dto/checkout-response.dto';
import { CheckoutApplicationError } from '../errors/checkout-application.error';
import { mapCheckoutSessionToDtoWithCustomer } from '../mappers/map-checkout-session-to-dto';
import { resolveSkuForCartItem } from '../services/checkout-catalog-resolver.service';
import { calculateCheckoutTotals } from '../services/checkout-totals-calculator.service';

export interface CompleteCheckoutCommand {
  readonly identityId: string;
  readonly sessionId: string;
  readonly warehouseId: string;
  readonly shippingAddressId: string;
  readonly paymentProvider: string;
}

export class CompleteCheckoutHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly productRepository: IProductRepository,
    private readonly checkoutSessionRepository: ICheckoutSessionRepository,
    private readonly createOrderFromCheckoutService: ICreateOrderFromCheckoutService,
    private readonly paymentInitiationService: IPaymentInitiationService,
  ) {}

  async execute(
    command: CompleteCheckoutCommand,
  ): Promise<Result<CompleteCheckoutResponseDto, CheckoutApplicationError>> {
    try {
      if (!isPaymentProvider(command.paymentProvider)) {
        return Result.fail(
          new CheckoutApplicationError('Unsupported payment provider', 'INVALID_PAYMENT_PROVIDER'),
        );
      }

      const user = await this.userRepository.findByIdentityId(command.identityId);
      if (!user) {
        return Result.fail(new CheckoutApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const shippingAddress = user.getAddresses().find((address) => address.id === command.shippingAddressId);
      if (!shippingAddress) {
        return Result.fail(new CheckoutApplicationError('Shipping address not found', 'SHIPPING_ADDRESS_NOT_FOUND'));
      }

      const session = await this.checkoutSessionRepository.findById(command.sessionId);
      if (!session) {
        return Result.fail(new CheckoutApplicationError('Checkout session not found', 'CHECKOUT_SESSION_NOT_FOUND'));
      }

      if (session.getCustomerId() && session.getCustomerId() !== user.id) {
        return Result.fail(new CheckoutApplicationError('Checkout session access denied', 'CHECKOUT_ACCESS_DENIED'));
      }

      if (session.getStatus() !== CheckoutStatus.STARTED) {
        return Result.fail(new CheckoutApplicationError('Checkout session is not active', 'CHECKOUT_NOT_ACTIVE'));
      }

      const lines = session.getLines();
      const adjustments = session.getAdjustments();
      const currency = lines[0]?.getCurrency();
      if (!currency) {
        return Result.fail(new CheckoutApplicationError('Checkout currency is required', 'INVALID_CURRENCY'));
      }

      const totals = calculateCheckoutTotals(
        lines.map((line) => ({
          unitPriceAmount: line.getUnitPriceAmount(),
          quantity: line.getQuantity(),
        })),
        adjustments.map((adjustment) => ({
          type: adjustment.getType(),
          amount: adjustment.getAmount(),
        })),
      );

      const orderLines: Array<{
        productId: string;
        variantId?: string;
        sku: string;
        quantity: number;
        unitPriceAmount: number;
        unitPriceCurrency: string;
        warehouseId: string;
      }> = [];

      for (const line of lines) {
        const resolved = await resolveSkuForCartItem(
          this.productRepository,
          line.getProductId(),
          line.getVariantId(),
        );
        if (resolved instanceof CheckoutApplicationError) {
          return Result.fail(resolved);
        }

        orderLines.push({
          productId: line.getProductId(),
          variantId: line.getVariantId(),
          sku: resolved.sku,
          quantity: line.getQuantity(),
          unitPriceAmount: line.getUnitPriceAmount(),
          unitPriceCurrency: line.getCurrency(),
          warehouseId: command.warehouseId,
        });
      }

      const orderResult = await this.createOrderFromCheckoutService.execute({
        customerId: user.id,
        totalAmount: totals.totalAmount,
        totalCurrency: currency,
        lines: orderLines,
      });

      if (orderResult.isFailure) {
        return Result.fail(
          new CheckoutApplicationError(orderResult.getError().message, orderResult.getError().code),
        );
      }

      const order = orderResult.getValue();
      const completeResult = session.complete(order.orderId);
      if (completeResult.isFailure) {
        return Result.fail(
          new CheckoutApplicationError(completeResult.getError().message, completeResult.getError().code),
        );
      }

      await this.checkoutSessionRepository.save(session);

      const paymentResult = await this.paymentInitiationService.initiate({
        orderId: order.orderId,
        amount: totals.totalAmount,
        currency,
        provider: command.paymentProvider,
        customerId: user.id,
      });

      if (paymentResult.isFailure) {
        return Result.fail(
          new CheckoutApplicationError(paymentResult.getError().message, paymentResult.getError().code),
        );
      }

      const payment = paymentResult.getValue();
      const checkoutDto = mapCheckoutSessionToDtoWithCustomer(session, user.id);

      return Result.ok({
        ...checkoutDto,
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        payment: {
          paymentId: payment.paymentId,
          provider: payment.provider,
          redirectUrl: payment.redirectUrl,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete checkout';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'COMPLETE_CHECKOUT_FAILED';
      return Result.fail(new CheckoutApplicationError(message, code));
    }
  }
}
