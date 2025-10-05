import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: { email: string; password: string; fullName: string; phone?: string }) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: { email: string }) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: { token: string; newPassword: string }) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Get('validate-reset-token')
  async validateResetToken(@Query('token') token: string) {
    return this.authService.validateResetToken(token);
  }
}
