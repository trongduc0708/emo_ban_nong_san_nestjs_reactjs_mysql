import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: {
        email: string;
        password: string;
        fullName: string;
        phone?: string;
    }): Promise<{
        success: boolean;
        user: {
            id: number;
            email: string;
            fullName: string;
            phone: string | null;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
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
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
}
