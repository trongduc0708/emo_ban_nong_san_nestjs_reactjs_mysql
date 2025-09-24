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
