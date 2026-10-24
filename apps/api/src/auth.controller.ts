import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtGuard } from './security';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  companyName: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new wholesale buyer organization' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(dto);
    this.setAuthCookie(res, result.token);
    return { user: result.user };
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto.email, dto.password);
    this.setAuthCookie(res, result.token);
    return { user: result.user };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Clear HTTP-only session cookie' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      path: '/',
    });
    return { ok: true, message: 'Successfully signed out' };
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  me(@Req() req: Request & { user: any }) {
    return {
      user: {
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role,
        companyName: req.user.companyName,
      },
    };
  }

  private setAuthCookie(res: Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
  }
}
