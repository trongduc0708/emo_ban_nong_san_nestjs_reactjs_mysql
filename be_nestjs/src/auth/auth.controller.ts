import { Body, Controller, Post, Get, Query, Put, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
import { Response } from 'express';
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

  @Get('google')
  async googleAuth() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    // Redirect URI phải là backend URL, không phải frontend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${backendUrl}/api/auth/google/callback`;
    const scope = 'openid email profile';
    const responseType = 'code';
    
    if (!clientId) {
      throw new BadRequestException('Google Client ID chưa được cấu hình');
    }
    
    // Log để debug
    console.log('=== Google OAuth Debug ===');
    console.log('Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);
    console.log('Backend URL:', backendUrl);
    console.log('========================');
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&access_type=online&prompt=select_account`;
    
    return { url: googleAuthUrl };
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Query('error') error: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    if (error) {
      // Redirect to frontend with error
      return res.redirect(`${frontendUrl}/auth/google/callback?error=${encodeURIComponent(error)}`);
    }
    
    if (!code) {
      // Redirect to frontend with error
      return res.redirect(`${frontendUrl}/auth/google/callback?error=${encodeURIComponent('No authorization code received')}`);
    }
    
    try {
      const result = await this.authService.googleCallback(code);
      // Redirect to frontend with token
      return res.redirect(result.redirectUrl);
    } catch (err: any) {
      // Redirect to frontend with error
      return res.redirect(`${frontendUrl}/auth/google/callback?error=${encodeURIComponent(err.message || 'Authentication failed')}`);
    }
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
