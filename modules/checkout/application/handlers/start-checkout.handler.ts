import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import type { IProductRepository } from '../../../catalog/domain/repositories/i-product-repository';
import type { ICartRepository } from '../../../cart/domain/repositories/i-cart-repository';
import type { IInventoryItemRepository } from '../../../inventory/domain/repositories/i-inventory-item-repository';
import type { IPromotionEvaluationService } from '../../../promotion/application/contracts/promotion-evaluation.contract';
import type { IUserRepository } from '../../../user/domain/repositories/i-user-repository';
import { CheckoutSession } from '../../domain/aggregates/checkout-session';
import { CheckoutAdjustment, CheckoutAdjustmentType } from '../../domain/entities/checkout-adjustment';
import { CheckoutLine } from '../../domain/entities/checkout-line';
import type { ICheckoutSessionRepository } from '../../domain/repositories/i-checkout-session-repository';
import type { CheckoutResponseDto } from '../dto/checkout-response.dto';
import { CheckoutApplicationError } from '../errors/checkout-application.error';
import { mapCheckoutSessionToDtoWithCustomer } from '../mappers/map-checkout-session-to-dto';
import { resolveSkuForCartItem } from '../services/checkout-catalog-resolver.service';
import { validateInventoryAvailability } from '../services/checkout-inventory-validator.service';
import { calculateCheckoutTotals } from '../services/checkout-totals-calculator.service';

export interface StartCheckoutCommand {
  readonly identityId: string;
  readonly warehouseId: string;
  readonly shippingAddressId: string;
  readonly couponCode?: string;
}

export class StartCheckoutHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cartRepository: ICartRepository,
    private readonly productRepository: IProductRepository,
    private readonly inventoryRepository: IInventoryItemRepository,
    private readonly promotionEvaluationService: IPromotionEvaluationService,
    private readonly checkoutSessionRepository: ICheckoutSessionRepository,
  ) {}

  async execute(command: StartCheckoutCommand): Promise<Result<CheckoutResponseDto, CheckoutApplicationError>> {
    try {
      const user = await this.userRepository.findByIdentityId(command.identityId);
      if (!user) {
        return Result.fail(new CheckoutApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const shippingAddress = user.getAddresses().find((address) => address.id === command.shippingAddressId);
      if (!shippingAddress) {
        return Result.fail(new CheckoutApplicationError('Shipping address not found', 'SHIPPING_ADDRESS_NOT_FOUND'));
      }

      const cart = await this.cartRepository.findByCustomerId(user.id);
      if (!cart || cart.getItems().length === 0) {
        return Result.fail(new CheckoutApplicationError('Cart is empty', 'CART_EMPTY'));
      }

      const resolvedLines: Array<{
        productId: string;
        variantId?: string;
        sku: string;
        quantity: number;
        unitPriceAmount: number;
        currency: string;
      }> = [];

      for (const item of cart.getItems()) {
        const productReference = item.getProductReference();
        const resolved = await resolveSkuForCartItem(
          this.productRepository,
          productReference.productId,
          productReference.variantId,
        );
        if (resolved instanceof CheckoutApplicationError) {
          return Result.fail(resolved);
        }

        const unitPrice = item.getUnitPrice();
        resolvedLines.push({
          productId: resolved.productId,
          variantId: resolved.variantId,
          sku: resolved.sku,
          quantity: item.getQuantity().value,
          unitPriceAmount: unitPrice.amount,
          currency: unitPrice.currency,
        });
      }

      const inventoryError = await validateInventoryAvailability(
        this.inventoryRepository,
        command.warehouseId,
        resolvedLines.map((line) => ({ sku: line.sku, quantity: line.quantity })),
      );
      if (inventoryError) {
        return Result.fail(inventoryError);
      }

      const currency = resolvedLines[0]?.currency;
      if (!currency) {
        return Result.fail(new CheckoutApplicationError('Cart currency is required', 'INVALID_CURRENCY'));
      }

      const subtotalAmount = resolvedLines.reduce(
        (total, line) => total + line.unitPriceAmount * line.quantity,
        0,
      );

      const promotionResult = await this.promotionEvaluationService.evaluate({
        couponCode: command.couponCode,
        subtotalAmount,
        currency,
        customerId: user.id,
      });
      if (promotionResult.isFailure) {
        return Result.fail(
          new CheckoutApplicationError(promotionResult.getError().message, promotionResult.getError().code),
        );
      }

      const sessionId = randomUUID();
      const sessionResult = CheckoutSession.start(sessionId, cart.id, user.id);
      if (sessionResult.isFailure) {
        return Result.fail(
          new CheckoutApplicationError(sessionResult.getError().message, sessionResult.getError().code),
        );
      }

      const session = sessionResult.getValue();
      for (const line of resolvedLines) {
        session.addLine(
          CheckoutLine.create(
            randomUUID(),
            line.productId,
            line.quantity,
            line.unitPriceAmount,
            line.currency,
            line.variantId,
          ),
        );
      }

      const promotion = promotionResult.getValue();
      if (promotion) {
        session.addAdjustment(
          CheckoutAdjustment.create(
            randomUUID(),
            CheckoutAdjustmentType.DISCOUNT,
            promotion.label,
            promotion.discountAmount,
            promotion.currency,
          ),
        );
      }

      const totals = calculateCheckoutTotals(
        session.getLines().map((line) => ({
          unitPriceAmount: line.getUnitPriceAmount(),
          quantity: line.getQuantity(),
        })),
        session.getAdjustments().map((adjustment) => ({
          type: adjustment.getType(),
          amount: adjustment.getAmount(),
        })),
      );

      if (totals.totalAmount <= 0) {
        return Result.fail(new CheckoutApplicationError('Checkout total must be positive', 'INVALID_CHECKOUT_TOTAL'));
      }

      await this.checkoutSessionRepository.save(session);
      return Result.ok(mapCheckoutSessionToDtoWithCustomer(session, user.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start checkout';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'START_CHECKOUT_FAILED';
      return Result.fail(new CheckoutApplicationError(message, code));
    }
  }
}
