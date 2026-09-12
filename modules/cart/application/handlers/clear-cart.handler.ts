import { Result } from '@novacommerce/building-blocks';
import type { IUserRepository } from '../../../user/domain/repositories/i-user-repository';
import type { ICartRepository } from '../../domain/repositories/i-cart-repository';
import type { CartResponseDto } from '../dto/cart-response.dto';
import { CartApplicationError } from '../errors/cart-application.error';
import { mapCartToDto } from '../mappers/map-cart-to-dto';
import { getOrCreateCartForCustomer } from '../services/cart-access.service';

export interface ClearCartCommand {
  readonly identityId: string;
}

export class ClearCartHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cartRepository: ICartRepository,
  ) {}

  async execute(command: ClearCartCommand): Promise<Result<CartResponseDto, CartApplicationError>> {
    try {
      const user = await this.userRepository.findByIdentityId(command.identityId);
      if (!user) {
        return Result.fail(new CartApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const cart = await getOrCreateCartForCustomer(this.cartRepository, user.id);
      const clearResult = cart.clear();
      if (clearResult.isFailure) {
        return Result.fail(new CartApplicationError(clearResult.getError().message, clearResult.getError().code));
      }

      await this.cartRepository.save(cart);
      return Result.ok(mapCartToDto(cart));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clear cart';
      const code =
        error instanceof Error && 'code' in error ? String((error as { code: string }).code) : 'CLEAR_CART_FAILED';
      return Result.fail(new CartApplicationError(message, code));
    }
  }
}
