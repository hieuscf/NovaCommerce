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
import type { Request } from 'express';
import { ChangePasswordHandler } from '../../application/handlers/change-password.handler';
import { LoginIdentityHandler } from '../../application/handlers/login-identity.handler';
import { LogoutIdentityHandler } from '../../application/handlers/logout-identity.handler';
import { OAuthLoginHandler } from '../../application/handlers/oauth-login.handler';
import { RefreshTokenHandler } from '../../application/handlers/refresh-token.handler';
import { RegisterIdentityHandler } from '../../application/handlers/register-identity.handler';
import { RequestPasswordResetHandler } from '../../application/handlers/request-password-reset.handler';
import { ResetPasswordHandler } from '../../application/handlers/reset-password.handler';
import { CurrentPrincipal } from '../decorators/current-principal.decorator';
import { PublicRoute } from '../decorators/public-route.decorator';
import { ChangePasswordRequestDto } from '../dto/change-password-request.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LogoutRequestDto } from '../dto/logout-request.dto';
import { OAuthCallbackRequestDto } from '../dto/oauth-callback-request.dto';
import { RefreshTokenRequestDto } from '../dto/refresh-token-request.dto';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { RequestPasswordResetDto } from '../dto/request-password-reset.dto';
import { ResetPasswordRequestDto } from '../dto/reset-password-request.dto';
import { mapIdentityResult } from '../utils/map-identity-result';

interface RequestWithContext extends Request {
  requestId?: string;
  correlationId?: string;
}

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

  @PublicRoute()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new identity' })
  async register(@Body() body: RegisterRequestDto, @Req() request: RequestWithContext) {
    const result = await this.registerHandler.execute({
      email: body.email,
      password: body.password,
      requestContext: this.extractContext(request),
    });
    return mapIdentityResult(result, HttpStatus.CREATED);
  }

  @PublicRoute()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() body: LoginRequestDto, @Req() request: RequestWithContext) {
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
    @CurrentPrincipal() user: SecurityContext,
    @Body() body: LogoutRequestDto,
    @Req() request: RequestWithContext,
  ) {
    const result = await this.logoutHandler.execute({
      identityId: user.userId,
      refreshToken: body.refreshToken,
      requestContext: this.extractContext(request),
    });
    mapIdentityResult(result, HttpStatus.NO_CONTENT);
  }

  @PublicRoute()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue new access token' })
  async refresh(@Body() body: RefreshTokenRequestDto, @Req() request: RequestWithContext) {
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
    @CurrentPrincipal() user: SecurityContext,
    @Body() body: ChangePasswordRequestDto,
    @Req() request: RequestWithContext,
  ) {
    const result = await this.changePasswordHandler.execute({
      identityId: user.userId,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
      requestContext: this.extractContext(request),
    });
    mapIdentityResult(result, HttpStatus.NO_CONTENT);
  }

  @PublicRoute()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset instructions' })
  async forgotPassword(@Body() body: RequestPasswordResetDto, @Req() request: RequestWithContext) {
    const result = await this.requestPasswordResetHandler.execute({
      email: body.email,
      requestContext: this.extractContext(request),
    });
    return mapIdentityResult(result);
  }

  @PublicRoute()
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset password using one-time token' })
  async resetPassword(@Body() body: ResetPasswordRequestDto, @Req() request: RequestWithContext) {
    const result = await this.resetPasswordHandler.execute({
      token: body.token,
      newPassword: body.newPassword,
      requestContext: this.extractContext(request),
    });
    mapIdentityResult(result, HttpStatus.NO_CONTENT);
  }

  @PublicRoute()
  @Post('oauth/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete OAuth/OIDC login callback' })
  async oauthCallback(@Body() body: OAuthCallbackRequestDto, @Req() request: RequestWithContext) {
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

  private extractContext(request: RequestWithContext) {
    return {
      requestId: request.requestId,
      correlationId: request.correlationId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };
  }
}
