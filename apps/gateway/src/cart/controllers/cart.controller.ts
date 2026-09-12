import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import type { SecurityContext } from '@novacommerce/building-blocks';
import { AddCartItemHandler } from '../../../../../modules/cart/application/handlers/add-cart-item.handler';
import { ClearCartHandler } from '../../../../../modules/cart/application/handlers/clear-cart.handler';
import { GetCartHandler } from '../../../../../modules/cart/application/handlers/get-cart.handler';
import { RemoveCartItemHandler } from '../../../../../modules/cart/application/handlers/remove-cart-item.handler';
import { UpdateCartItemQuantityHandler } from '../../../../../modules/cart/application/handlers/update-cart-item-quantity.handler';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { AddCartItemRequestDto } from '../dto/add-cart-item-request.dto';
import { CartEnvelopeDto } from '../dto/cart-response.dto';
import { UpdateCartItemQuantityRequestDto } from '../dto/update-cart-item-quantity-request.dto';
import { mapCartResult } from '../utils/map-cart-result';

@ApiTags('cart')
@ApiBearerAuth('bearer')
@Controller('users/me/cart')
export class CartController {
  constructor(
    private readonly getCartHandler: GetCartHandler,
    private readonly addCartItemHandler: AddCartItemHandler,
    private readonly updateCartItemQuantityHandler: UpdateCartItemQuantityHandler,
    private readonly removeCartItemHandler: RemoveCartItemHandler,
    private readonly clearCartHandler: ClearCartHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current cart', description: 'Returns the authenticated customer cart, creating one if needed.' })
  @ApiOkResponse({ type: CartEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async getCart(@CurrentUser() user: SecurityContext) {
    const result = await this.getCartHandler.execute({ identityId: user.userId });
    return mapCartResult(result);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add cart item', description: 'Adds a product to the cart or merges quantity for an existing line.' })
  @ApiCreatedResponse({ type: CartEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async addItem(@CurrentUser() user: SecurityContext, @Body() body: AddCartItemRequestDto) {
    const result = await this.addCartItemHandler.execute({
      identityId: user.userId,
      productId: body.productId,
      variantId: body.variantId,
      quantity: body.quantity,
      unitPriceAmount: body.unitPriceAmount,
      unitPriceCurrency: body.unitPriceCurrency,
    });
    return mapCartResult(result, HttpStatus.CREATED);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity', description: 'Sets the quantity for an existing cart line.' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID' })
  @ApiOkResponse({ type: CartEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto })
  async updateItemQuantity(
    @CurrentUser() user: SecurityContext,
    @Param('itemId') itemId: string,
    @Body() body: UpdateCartItemQuantityRequestDto,
  ) {
    const result = await this.updateCartItemQuantityHandler.execute({
      identityId: user.userId,
      itemId,
      quantity: body.quantity,
    });
    return mapCartResult(result);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove cart item', description: 'Removes a line item from the cart.' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID' })
  @ApiOkResponse({ type: CartEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async removeItem(@CurrentUser() user: SecurityContext, @Param('itemId') itemId: string) {
    const result = await this.removeCartItemHandler.execute({
      identityId: user.userId,
      itemId,
    });
    return mapCartResult(result);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear cart', description: 'Removes all items from the cart.' })
  @ApiOkResponse({ type: CartEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async clearCart(@CurrentUser() user: SecurityContext) {
    const result = await this.clearCartHandler.execute({ identityId: user.userId });
    return mapCartResult(result);
  }
}
