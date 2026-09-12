import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import type { IUserRepository } from '../../../user/domain/repositories/i-user-repository';
import { CartItem } from '../../domain/entities/cart-item';
import type { ICartRepository } from '../../domain/repositories/i-cart-repository';
import { Money } from '../../domain/value-objects/money';
import { ProductReference } from '../../domain/value-objects/product-reference';
import { Quantity } from '../../domain/value-objects/quantity';
import type { CartResponseDto } from '../dto/cart-response.dto';
import { CartApplicationError } from '../errors/cart-application.error';
import { mapCartToDto } from '../mappers/map-cart-to-dto';
import { getOrCreateCartForCustomer } from '../services/cart-access.service';

export interface AddCartItemCommand {
  readonly identityId: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly quantity: number;
  readonly unitPriceAmount: number;
  readonly unitPriceCurrency: string;
}

export class AddCartItemHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cartRepository: ICartRepository,
  ) {}

  async execute(command: AddCartItemCommand): Promise<Result<CartResponseDto, CartApplicationError>> {
    try {
      const user = await this.userRepository.findByIdentityId(command.identityId);
      if (!user) {
        return Result.fail(new CartApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const cart = await getOrCreateCartForCustomer(this.cartRepository, user.id);
      const productReference = ProductReference.create(command.productId, command.variantId);
      const quantity = Quantity.create(command.quantity);
      const unitPrice = Money.create(command.unitPriceAmount, command.unitPriceCurrency);
      const item = CartItem.create(randomUUID(), productReference, quantity, unitPrice);

      const addResult = cart.addItem(item);
      if (addResult.isFailure) {
        return Result.fail(new CartApplicationError(addResult.getError().message, addResult.getError().code));
      }

      await this.cartRepository.save(cart);
      return Result.ok(mapCartToDto(cart));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add cart item';
      const code =
        error instanceof Error && 'code' in error
          ? String((error as { code: string }).code)
          : 'ADD_CART_ITEM_FAILED';
      return Result.fail(new CartApplicationError(message, code));
    }
  }
}
