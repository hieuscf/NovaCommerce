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
  ApiConflictResponse,
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
import { AddAddressHandler } from '../../../../../modules/user/application/handlers/add-address.handler';
import { CreateCustomerProfileHandler } from '../../../../../modules/user/application/handlers/create-customer-profile.handler';
import { GetCustomerAccountHandler } from '../../../../../modules/user/application/handlers/get-customer-account.handler';
import { GetCustomerAddressesHandler } from '../../../../../modules/user/application/handlers/get-customer-addresses.handler';
import { GetCustomerPreferencesHandler } from '../../../../../modules/user/application/handlers/get-customer-preferences.handler';
import { GetCustomerProfileHandler } from '../../../../../modules/user/application/handlers/get-customer-profile.handler';
import { RemoveAddressHandler } from '../../../../../modules/user/application/handlers/remove-address.handler';
import { SetDefaultAddressHandler } from '../../../../../modules/user/application/handlers/set-default-address.handler';
import { UpdateAddressHandler } from '../../../../../modules/user/application/handlers/update-address.handler';
import { UpdateCustomerPreferencesHandler } from '../../../../../modules/user/application/handlers/update-customer-preferences.handler';
import { UpdateCustomerProfileHandler } from '../../../../../modules/user/application/handlers/update-customer-profile.handler';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AddressRequestDto } from '../dto/address-request.dto';
import { CreateProfileRequestDto } from '../dto/create-profile-request.dto';
import { UpdatePreferencesRequestDto } from '../dto/update-preferences-request.dto';
import { UpdateProfileRequestDto } from '../dto/update-profile-request.dto';
import {
  UserAccountEnvelopeDto,
  UserAddressEnvelopeDto,
  UserAddressListEnvelopeDto,
  UserPreferenceListEnvelopeDto,
  UserProfileEnvelopeDto,
} from '../dto/user-response.dto';
import { mapUserResult } from '../utils/map-user-result';

@ApiTags('users')
@ApiBearerAuth('bearer')
@Controller('users/me')
export class UsersController {
  constructor(
    private readonly createCustomerProfileHandler: CreateCustomerProfileHandler,
    private readonly getCustomerProfileHandler: GetCustomerProfileHandler,
    private readonly getCustomerAccountHandler: GetCustomerAccountHandler,
    private readonly updateCustomerProfileHandler: UpdateCustomerProfileHandler,
    private readonly getCustomerAddressesHandler: GetCustomerAddressesHandler,
    private readonly addAddressHandler: AddAddressHandler,
    private readonly updateAddressHandler: UpdateAddressHandler,
    private readonly removeAddressHandler: RemoveAddressHandler,
    private readonly setDefaultAddressHandler: SetDefaultAddressHandler,
    private readonly getCustomerPreferencesHandler: GetCustomerPreferencesHandler,
    private readonly updateCustomerPreferencesHandler: UpdateCustomerPreferencesHandler,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create customer profile',
    description: 'Creates a customer profile linked to the authenticated identity. Each identity may have at most one profile.',
  })
  @ApiCreatedResponse({ type: UserProfileEnvelopeDto, description: 'Customer profile created' })
  @ApiConflictResponse({ type: ApiErrorResponseDto, description: 'Profile already exists for this identity' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto, description: 'Validation or business rule failure' })
  async createProfile(@CurrentUser() user: SecurityContext, @Body() body: CreateProfileRequestDto) {
    const result = await this.createCustomerProfileHandler.execute({
      identityId: user.userId,
      displayName: body.displayName,
      phoneNumber: body.phoneNumber,
      avatarUrl: body.avatarUrl,
    });
    return mapUserResult(result, HttpStatus.CREATED);
  }

  @Get()
  @ApiOperation({
    summary: 'Get customer profile',
    description: 'Returns the profile for the authenticated identity.',
  })
  @ApiOkResponse({ type: UserProfileEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'Customer profile not found' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async getProfile(@CurrentUser() user: SecurityContext) {
    const result = await this.getCustomerProfileHandler.execute({ identityId: user.userId });
    return mapUserResult(result);
  }

  @Get('account')
  @ApiOperation({
    summary: 'Get customer account summary',
    description: 'Returns profile metadata including address and preference counts.',
  })
  @ApiOkResponse({ type: UserAccountEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'Customer account not found' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async getAccount(@CurrentUser() user: SecurityContext) {
    const result = await this.getCustomerAccountHandler.execute({ identityId: user.userId });
    return mapUserResult(result);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update customer profile',
    description: 'Partially updates display name, phone number, and/or avatar URL.',
  })
  @ApiOkResponse({ type: UserProfileEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'Customer profile not found' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto, description: 'Validation or business rule failure' })
  async updateProfile(@CurrentUser() user: SecurityContext, @Body() body: UpdateProfileRequestDto) {
    const result = await this.updateCustomerProfileHandler.execute({
      identityId: user.userId,
      displayName: body.displayName,
      phoneNumber: body.phoneNumber,
      avatarUrl: body.avatarUrl,
    });
    return mapUserResult(result);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'List customer addresses' })
  @ApiOkResponse({ type: UserAddressListEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'Customer profile not found' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async listAddresses(@CurrentUser() user: SecurityContext) {
    const result = await this.getCustomerAddressesHandler.execute({ identityId: user.userId });
    return mapUserResult(result);
  }

  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add customer address',
    description: 'Adds a shipping/billing address. The first address is automatically set as default unless specified.',
  })
  @ApiCreatedResponse({ type: UserAddressEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'Customer profile not found' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto, description: 'Invalid address fields' })
  async addAddress(@CurrentUser() user: SecurityContext, @Body() body: AddressRequestDto) {
    const result = await this.addAddressHandler.execute({
      identityId: user.userId,
      label: body.label,
      line1: body.line1,
      line2: body.line2,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      country: body.country,
      isDefault: body.isDefault,
    });
    return mapUserResult(result, HttpStatus.CREATED);
  }

  @Patch('addresses/:addressId')
  @ApiOperation({ summary: 'Update customer address' })
  @ApiParam({ name: 'addressId', description: 'Address UUID', example: '33333333-3333-3333-3333-333333333333' })
  @ApiOkResponse({ type: UserAddressEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'Customer profile or address not found' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto, description: 'Invalid address fields' })
  async updateAddress(
    @CurrentUser() user: SecurityContext,
    @Param('addressId') addressId: string,
    @Body() body: AddressRequestDto,
  ) {
    const result = await this.updateAddressHandler.execute({
      identityId: user.userId,
      addressId,
      label: body.label,
      line1: body.line1,
      line2: body.line2,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      country: body.country,
    });
    return mapUserResult(result);
  }

  @Delete('addresses/:addressId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove customer address' })
  @ApiParam({ name: 'addressId', description: 'Address UUID', example: '33333333-3333-3333-3333-333333333333' })
  @ApiNoContentResponse({ description: 'Address removed' })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'Customer profile or address not found' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async removeAddress(@CurrentUser() user: SecurityContext, @Param('addressId') addressId: string) {
    const result = await this.removeAddressHandler.execute({
      identityId: user.userId,
      addressId,
    });
    mapUserResult(result);
  }

  @Post('addresses/:addressId/default')
  @ApiOperation({
    summary: 'Set default customer address',
    description: 'Marks the given address as default and clears the default flag on all other addresses.',
  })
  @ApiParam({ name: 'addressId', description: 'Address UUID', example: '33333333-3333-3333-3333-333333333333' })
  @ApiOkResponse({ type: UserAddressEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'Customer profile or address not found' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto, description: 'Address is already default' })
  async setDefaultAddress(
    @CurrentUser() user: SecurityContext,
    @Param('addressId') addressId: string,
  ) {
    const result = await this.setDefaultAddressHandler.execute({
      identityId: user.userId,
      addressId,
    });
    return mapUserResult(result);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get customer preferences' })
  @ApiOkResponse({ type: UserPreferenceListEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'Customer profile not found' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async getPreferences(@CurrentUser() user: SecurityContext) {
    const result = await this.getCustomerPreferencesHandler.execute({ identityId: user.userId });
    return mapUserResult(result);
  }

  @Patch('preferences')
  @ApiOperation({
    summary: 'Update customer preferences',
    description: 'Upserts one or more preference key-value pairs. Supported keys include language, currency, and notification/marketing channels.',
  })
  @ApiOkResponse({ type: UserPreferenceListEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'Customer profile not found' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto, description: 'Unsupported preference key or empty update' })
  async updatePreferences(
    @CurrentUser() user: SecurityContext,
    @Body() body: UpdatePreferencesRequestDto,
  ) {
    const result = await this.updateCustomerPreferencesHandler.execute({
      identityId: user.userId,
      preferences: body.preferences,
    });
    return mapUserResult(result);
  }
}
