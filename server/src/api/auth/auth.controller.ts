import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { COOKIE_NAMES } from '../../common/constants/app.constants';
import { setAuthCookies, clearAuthCookies } from '../../utils/cookie.utils';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getCookieConfig() {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const accessTokenExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');
    const refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    return { isProduction, accessTokenExpiresIn, refreshTokenExpiresIn };
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { user, tokens } = await this.authService.register(registerDto);
    
    // Set HTTP-only cookies
    const { isProduction, accessTokenExpiresIn, refreshTokenExpiresIn } = this.getCookieConfig();
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken, isProduction, accessTokenExpiresIn, refreshTokenExpiresIn);

    return {
      success: true,
      message: 'Account created successfully',
      data: { user },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { user, tokens } = await this.authService.login(loginDto);
    
    // Set HTTP-only cookies
    const { isProduction, accessTokenExpiresIn, refreshTokenExpiresIn } = this.getCookieConfig();
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken, isProduction, accessTokenExpiresIn, refreshTokenExpiresIn);

    return {
      success: true,
      message: 'Login successful',
      data: { user },
    };
  }

  @Post('token/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(
    @Req() req: Request,
    @Body() body: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; message: string }> {
    // Support both cookie-based (web) and body-based (mobile) refresh tokens
    const refreshToken =
      req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] || body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const tokens = await this.authService.refreshToken(refreshToken);
    
    // Set new HTTP-only cookies (for web clients)
    const { isProduction, accessTokenExpiresIn, refreshTokenExpiresIn } = this.getCookieConfig();
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken, isProduction, accessTokenExpiresIn, refreshTokenExpiresIn);

    return {
      success: true,
      message: 'Token refreshed successfully',
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; message: string }> {
    // Clear HTTP-only cookies
    clearAuthCookies(res);

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user information',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUser() user: User): Promise<AuthResponseDto> {
    return {
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      },
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<AuthResponseDto> {
    const updatedUser = await this.authService.updateProfile(
      user.id,
      updateProfileDto,
    );

    return {
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    };
  }

  @Put('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePassword(
    @CurrentUser() user: User,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.authService.updatePassword(user.id, updatePasswordDto);

    return {
      success: true,
      message: 'Password updated successfully',
    };
  }
}
