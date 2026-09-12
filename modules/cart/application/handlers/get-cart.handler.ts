import { Result } from '@novacommerce/building-blocks';
import type { IUserRepository } from '../../../user/domain/repositories/i-user-repository';
import type { ICartRepository } from '../../domain/repositories/i-cart-repository';
import type { CartResponseDto } from '../dto/cart-response.dto';
import { CartApplicationError } from '../errors/cart-application.error';
import { mapCartToDto } from '../mappers/map-cart-to-dto';
import { getOrCreateCartForCustomer } from '../services/cart-access.service';

export interface GetCartQuery {
  readonly identityId: string;
}

export class GetCartHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cartRepository: ICartRepository,
  ) {}

  async execute(query: GetCartQuery): Promise<Result<CartResponseDto, CartApplicationError>> {
    try {
      const user = await this.userRepository.findByIdentityId(query.identityId);
      if (!user) {
        return Result.fail(new CartApplicationError('Customer profile not found', 'USER_NOT_FOUND'));
      }

      const cart = await getOrCreateCartForCustomer(this.cartRepository, user.id);
      return Result.ok(mapCartToDto(cart));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get cart';
      const code =
        error instanceof Error && 'code' in error ? String((error as { code: string }).code) : 'GET_CART_FAILED';
      return Result.fail(new CartApplicationError(message, code));
    }
  }
}
