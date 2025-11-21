import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client | null;

  constructor(
    private readonly prisma: PrismaService, 
    private readonly jwt: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const googleClientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    // Redirect URI phải là backend URL
    const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000';
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI') || 
      `${backendUrl}/api/auth/google/callback`;
    
    if (googleClientId) {
      this.googleClient = new OAuth2Client({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        redirectUri,
      });
    } else {
      this.googleClient = null;
    }
  }

  private mapSafeUser(user: any) {
    return {
      id: Number(user.id),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
    };
  }

  async register(dto: { email: string; password: string; fullName: string; phone?: string }) {
    const { email, password, fullName, phone } = dto;
    if (!email || !password || !fullName) throw new BadRequestException({ error: 'Thiếu dữ liệu' });

    const exist = await this.prisma.user.findUnique({ where: { email } });
    if (exist) throw new BadRequestException({ error: 'Email đã được đăng ký' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        role: 'customer',
        provider: 'local',
      },
      select: { id: true, email: true, fullName: true, phone: true, avatarUrl: true, role: true },
    });

    // Tạo JWT token cho user mới đăng ký
    const payload = { id: Number(user.id), email: user.email, role: user.role };
    const token = await this.jwt.signAsync(payload);

    const safeUser = { ...user, id: Number(user.id) };
    return { success: true, token, user: safeUser };
  }

  async login(dto: { email: string; password: string }) {
    const { email, password } = dto;
    if (!email || !password) throw new BadRequestException({ error: 'Thiếu dữ liệu' });

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException({ error: 'Email hoặc mật khẩu không đúng' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException({ error: 'Email hoặc mật khẩu không đúng' });

    const payload = { id: Number(user.id), email: user.email, role: user.role };
    const token = await this.jwt.signAsync(payload);

    const safeUser = {
      id: Number(user.id),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
    };
    return { success: true, token, user: safeUser };
  }

  async googleLogin(idToken: string) {
    if (!idToken) {
      throw new BadRequestException({ error: 'Thiếu Google ID token' });
    }

    if (!this.googleClient) {
      throw new BadRequestException({ error: 'Google OAuth chưa được cấu hình trên server' });
    }

    let payload: any;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      payload = ticket.getPayload();
    } catch (error) {
      throw new UnauthorizedException({ error: 'Google token không hợp lệ' });
    }

    if (!payload?.email) {
      throw new UnauthorizedException({ error: 'Không nhận được email từ Google' });
    }

    const email = payload.email.toLowerCase();
    const fullName = payload.name || payload.given_name || email.split('@')[0];
    const avatarUrl = payload.picture;
    const providerId = payload.sub;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          fullName,
          avatarUrl,
          provider: 'google',
          providerId,
          role: 'customer',
        },
      });
    } else if (user.provider !== 'google' || !user.providerId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'google',
          providerId,
          avatarUrl: user.avatarUrl ?? avatarUrl,
        },
      });
    }

    const payloadJwt = { id: Number(user.id), email: user.email, role: user.role };
    const token = await this.jwt.signAsync(payloadJwt);

    return {
      success: true,
      token,
      user: this.mapSafeUser(user),
    };
  }

  async googleCallback(code: string) {
    if (!this.googleClient) {
      throw new BadRequestException({ error: 'Google OAuth chưa được cấu hình trên server' });
    }

    let tokens: any;
    try {
      // Exchange authorization code for tokens
      const { tokens: tokenData } = await this.googleClient.getToken(code);
      tokens = tokenData;
    } catch (error) {
      throw new UnauthorizedException({ error: 'Không thể lấy token từ Google' });
    }

    if (!tokens.id_token) {
      throw new UnauthorizedException({ error: 'Không nhận được ID token từ Google' });
    }

    // Verify ID token
    let payload: any;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      payload = ticket.getPayload();
    } catch (error) {
      throw new UnauthorizedException({ error: 'Google token không hợp lệ' });
    }

    if (!payload?.email) {
      throw new UnauthorizedException({ error: 'Không nhận được email từ Google' });
    }

    const email = payload.email.toLowerCase();
    const fullName = payload.name || payload.given_name || email.split('@')[0];
    const avatarUrl = payload.picture;
    const providerId = payload.sub;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          fullName,
          avatarUrl,
          provider: 'google',
          providerId,
          role: 'customer',
        },
      });
    } else if (user.provider !== 'google' || !user.providerId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'google',
          providerId,
          avatarUrl: user.avatarUrl ?? avatarUrl,
        },
      });
    }

    const payloadJwt = { id: Number(user.id), email: user.email, role: user.role };
    const token = await this.jwt.signAsync(payloadJwt);

    const safeUser = this.mapSafeUser(user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const userRole = user.role as 'admin' | 'seller' | 'customer';
    const redirectTo = (userRole === 'admin' || userRole === 'seller') ? '/admin' : '/';
    
    // Redirect to frontend with token in URL
    const redirectUrl = `${frontendUrl}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(safeUser))}&redirect=${encodeURIComponent(redirectTo)}`;
    
    return { redirectUrl };
  }

  async forgotPassword(email: string) {
    if (!email) throw new BadRequestException({ error: 'Email là bắt buộc' });

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Không tiết lộ thông tin về việc email có tồn tại hay không
      return { success: true, message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu' };
    }

    // Tạo token reset password
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    // Xóa token cũ nếu có
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    // Lưu token mới
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Gửi email với link reset password
    try {
      await this.emailService.sendPasswordResetEmail(email, token, user.fullName);
      console.log(`Reset password email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send reset password email:', error);
      // Vẫn trả về success để không tiết lộ thông tin
    }

    return { success: true, message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu' };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new BadRequestException({ error: 'Token và mật khẩu mới là bắt buộc' });
    }

    if (newPassword.length < 6) {
      throw new BadRequestException({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Tìm token hợp lệ
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      throw new BadRequestException({ error: 'Token không hợp lệ' });
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException({ error: 'Token đã hết hạn' });
    }

    // Hash mật khẩu mới
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Cập nhật mật khẩu và xóa token
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash }
      }),
      this.prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
    ]);

    return { success: true, message: 'Đặt lại mật khẩu thành công' };
  }

  async validateResetToken(token: string) {
    if (!token) throw new BadRequestException({ error: 'Token là bắt buộc' });

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken) {
      throw new BadRequestException({ error: 'Token không hợp lệ' });
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException({ error: 'Token đã hết hạn' });
    }

    return { success: true, message: 'Token hợp lệ' };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy user');
    }

    return {
      success: true,
      data: {
        id: Number(user.id),
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async updateProfile(userId: number, dto: { fullName?: string; phone?: string; avatarUrl?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy user');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: BigInt(userId) },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.avatarUrl && { avatarUrl: dto.avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
      },
    });

    return {
      success: true,
      data: {
        id: Number(updatedUser.id),
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role,
      },
    };
  }

  async uploadAvatar(userId: number, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không có file được upload');
    }

    try {
      // File đã được validate và lưu bởi multer config
      // Tạo URL để truy cập file từ backend server
      const avatarUrl = `/uploads/avatars/${file.filename}`;

      const user = await this.prisma.user.update({
        where: { id: BigInt(userId) },
        data: { avatarUrl },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          avatarUrl: true,
          role: true,
        },
      });

      return {
        success: true,
        data: {
          id: Number(user.id),
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw new BadRequestException('Lỗi khi upload avatar');
    }
  }
}
