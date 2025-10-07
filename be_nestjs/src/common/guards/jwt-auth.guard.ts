import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] as string | undefined;
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException({ error: 'Thiếu token' });
    }
    const token = auth.slice(7);
    try {
      const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET || 'dev-secret' });
      console.log('JwtAuthGuard - payload:', payload);
      req.user = payload;
      return true;
    } catch (error) {
      console.log('JwtAuthGuard - error:', error);
      throw new UnauthorizedException({ error: 'Token không hợp lệ' });
    }
  }
}


