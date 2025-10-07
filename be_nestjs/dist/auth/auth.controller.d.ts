import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    forgotPassword(dto: {
        email: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(dto: {
        token: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    validateResetToken(token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, dto: {
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
    uploadAvatar(req: any, file: Express.Multer.File): Promise<{
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
