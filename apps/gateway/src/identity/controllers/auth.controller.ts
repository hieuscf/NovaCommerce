import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { SecurityContext } from '@novacommerce/building-blocks';
import { ChangePasswordHandler } from '../../../../../modules/identity/application/handlers/change-password.handler';
import { LoginIdentityHandler } from '../../../../../modules/identity/application/handlers/login-identity.handler';
import { LogoutIdentityHandler } from '../../../../../modules/identity/application/handlers/logout-identity.handler';
import { OAuthLoginHandler } from '../../../../../modules/identity/application/handlers/oauth-login.handler';
import { RefreshTokenHandler } from '../../../../../modules/identity/application/handlers/refresh-token.handler';
import { RegisterIdentityHandler } from '../../../../../modules/identity/application/handlers/register-identity.handler';
import { RequestPasswordResetHandler } from '../../../../../modules/identity/application/handlers/request-password-reset.handler';
import { ResetPasswordHandler } from '../../../../../modules/identity/application/handlers/reset-password.handler';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request';
import { ChangePasswordRequestDto } from '../dto/change-password-request.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LogoutRequestDto } from '../dto/logout-request.dto';
import { OAuthCallbackRequestDto } from '../dto/oauth-callback-request.dto';
import { RefreshTokenRequestDto } from '../dto/refresh-token-request.dto';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { RequestPasswordResetDto } from '../dto/request-password-reset.dto';
import { ResetPasswordRequestDto } from '../dto/reset-password-request.dto';
import { mapIdentityResult } from '../utils/map-identity-result';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterIdentityHandler,
    private readonly loginHandler: LoginIdentityHandler,
    private readonly logoutHandler: LogoutIdentityHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly changePasswordHandler: ChangePasswordHandler,
    private readonly requestPasswordResetHandler: RequestPasswordResetHandler,
    private readonly resetPasswordHandler: ResetPasswordHandler,
    private readonly oauthLoginHandler: OAuthLoginHandler,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new identity' })
  async register(@Body() body: RegisterRequestDto, @Req() request: AuthenticatedRequest) {
    const result = await this.registerHandler.execute({
      email: body.email,
      password: body.password,
      requestContext: this.extractContext(request),
    });
    return mapIdentityResult(result, HttpStatus.CREATED);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() body: LoginRequestDto, @Req() request: AuthenticatedRequest) {
    const result = await this.loginHandler.execute({
      email: body.email,
      password: body.password,
      requestContext: this.extractContext(request),
    });
    if (result.isFailure && result.getError().code === 'INVALID_CREDENTIALS') {
      throw new UnauthorizedException('Invalid credentials');
    }
    return mapIdentityResult(result);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and revoke refresh token session' })
  async logout(
    @CurrentUser() user: SecurityContext,
    @Body() body: LogoutRequestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const result = await this.logoutHandler.execute({
      identityId: user.userId,
      refreshToken: body.refreshToken,
      requestContext: this.extractContext(request),
    });
    mapIdentityResult(result, HttpStatus.NO_CONTENT);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue new access token' })
  async refresh(@Body() body: RefreshTokenRequestDto, @Req() request: AuthenticatedRequest) {
    const result = await this.refreshTokenHandler.execute({
      refreshToken: body.refreshToken,
      requestContext: this.extractContext(request),
    });
    if (result.isFailure) {
      throw new UnauthorizedException(result.getError().message);
    }
    return mapIdentityResult(result);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change password for authenticated identity' })
  async changePassword(
    @CurrentUser() user: SecurityContext,
    @Body() body: ChangePasswordRequestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const result = await this.changePasswordHandler.execute({
      identityId: user.userId,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
      requestContext: this.extractContext(request),
    });
    mapIdentityResult(result, HttpStatus.NO_CONTENT);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset instructions' })
  async forgotPassword(@Body() body: RequestPasswordResetDto, @Req() request: AuthenticatedRequest) {
    const result = await this.requestPasswordResetHandler.execute({
      email: body.email,
      requestContext: this.extractContext(request),
    });
    return mapIdentityResult(result);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset password using one-time token' })
  async resetPassword(@Body() body: ResetPasswordRequestDto, @Req() request: AuthenticatedRequest) {
    const result = await this.resetPasswordHandler.execute({
      token: body.token,
      newPassword: body.newPassword,
      requestContext: this.extractContext(request),
    });
    mapIdentityResult(result, HttpStatus.NO_CONTENT);
  }

  @Public()
  @Post('oauth/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete OAuth/OIDC login callback' })
  async oauthCallback(@Body() body: OAuthCallbackRequestDto, @Req() request: AuthenticatedRequest) {
    const result = await this.oauthLoginHandler.execute({
      provider: body.provider,
      code: body.code,
      state: body.state,
      redirectUri: body.redirectUri,
      codeVerifier: body.codeVerifier,
      requestContext: this.extractContext(request),
    });
    if (result.isFailure) {
      throw new UnprocessableEntityException(result.getError().message);
    }
    return mapIdentityResult(result);
  }

  private extractContext(request: AuthenticatedRequest) {
    return {
      requestId: request.requestId,
      correlationId: request.correlationId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };
  }
}
