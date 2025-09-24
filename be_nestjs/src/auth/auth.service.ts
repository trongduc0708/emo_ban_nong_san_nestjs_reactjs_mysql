import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

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

    const safeUser = { ...user, id: Number(user.id) };
    return { success: true, user: safeUser };
  }

  async login(dto: { email: string; password: string }) {
    const { email, password } = dto;
    if (!email || !password) throw new BadRequestException({ error: 'Thiếu dữ liệu' });

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException({ error: 'Email hoặc mật khẩu không đúng' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException({ error: 'Email hoặc mật khẩu không đúng' });

    const payload = { userId: Number(user.id), email: user.email, role: user.role };
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
}
