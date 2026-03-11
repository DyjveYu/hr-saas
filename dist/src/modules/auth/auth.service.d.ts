import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private readonly logger;
    private redis;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    getUserInfo(userId: number): Promise<{
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
    }>;
    logout(accessToken: string, userId: number): Promise<{
        code: number;
        message: string;
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
    }>;
}
