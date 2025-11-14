import { Body, Controller, Post, Get, Query, Put, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { multerConfig } from '../config/multer.config';

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

  @Post('google')
  async googleLogin(@Body() dto: { idToken: string }) {
    return this.authService.googleLogin(dto.idToken);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: { token: string; newPassword: string }) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Get('validate-reset-token')
  async validateResetToken(@Query('token') token: string) {
    return this.authService.validateResetToken(token);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() dto: { fullName?: string; phone?: string; avatarUrl?: string }) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    console.log('Upload avatar - req.user:', req.user);
    console.log('Upload avatar - req.user.id:', req.user?.id);
    
    if (!req.user?.id) {
      throw new BadRequestException('User ID not found in request');
    }
    
    return this.authService.uploadAvatar(req.user.id, file);
  }
}
