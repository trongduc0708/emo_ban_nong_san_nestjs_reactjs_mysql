import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from '../common/services/email.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    JwtModule.register({
      global: false,
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
