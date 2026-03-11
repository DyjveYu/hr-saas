import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        code: number;
        message: string;
        data: {
            access_token: string;
            refresh_token: string;
        };
    }>;
    logout(req: any): Promise<{
        code: number;
        message: string;
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        code: number;
        message: string;
        data: {
            access_token: string;
        };
    }>;
    getUserInfo(req: any): Promise<{
        code: number;
        message: string;
        data: {
            tenantName: string | undefined;
            id: bigint;
            username: string;
            tenantId: bigint | null;
            role: import("@prisma/client").$Enums.Role;
            realName: string | null;
            phone: string | null;
            status: import("@prisma/client").$Enums.UserStatus;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
