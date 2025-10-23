import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly emailService;
    constructor(prisma: PrismaService, jwt: JwtService, emailService: EmailService);
    register(dto: {
        email: string;
        password: string;
        fullName: string;
        phone?: string;
    }): Promise<{
        success: boolean;
        token: string;
        user: {
            id: number;
            email: string;
            fullName: string;
            phone: string | null;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    login(dto: {
        email: string;
        password: string;
    }): Promise<{
        success: boolean;
        token: string;
        user: {
            id: number;
            email: string;
            fullName: string;
            phone: string | null;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    validateResetToken(token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(userId: number): Promise<{
        success: boolean;
        data: {
            id: number;
            email: string;
            fullName: string;
            phone: string | null;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
        };
    }>;
    updateProfile(userId: number, dto: {
        fullName?: string;
        phone?: string;
        avatarUrl?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: number;
            email: string;
            fullName: string;
            phone: string | null;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    uploadAvatar(userId: number, file: Express.Multer.File): Promise<{
        success: boolean;
        data: {
            id: number;
            email: string;
            fullName: string;
            phone: string | null;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
}
