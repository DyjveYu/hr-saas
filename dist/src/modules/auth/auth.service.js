"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../common/prisma/prisma.service");
const ioredis_1 = __importDefault(require("ioredis"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    logger = new common_1.Logger('AuthModule');
    redis;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.redis = new ioredis_1.default({
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
            password: configService.get('REDIS_PASSWORD'),
            lazyConnect: true,
        });
    }
    async login(loginDto) {
        const { username, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { username },
        });
        if (!user) {
            throw new common_1.UnauthorizedException({
                code: 1001,
                message: '用户名或密码错误',
            });
        }
        if (user.status === 'DISABLED') {
            throw new common_1.UnauthorizedException({
                code: 1007,
                message: '账号已禁用',
            });
        }
        if (user.tenantId && user.role === 'COMPANY_ADMIN') {
            const company = await this.prisma.company.findUnique({
                where: { id: user.tenantId },
            });
            if (company && company.status === 'INACTIVE') {
                throw new common_1.UnauthorizedException({
                    code: 2009,
                    message: '公司已停用',
                });
            }
        }
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            throw new common_1.UnauthorizedException({
                code: 1006,
                message: '账号已锁定，请稍后重试',
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const newFailCount = user.loginFailCount + 1;
            const updateData = {
                loginFailCount: newFailCount,
            };
            if (newFailCount >= 5) {
                updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
            }
            await this.prisma.user.update({
                where: { id: user.id },
                data: updateData,
            });
            if (updateData.lockedUntil) {
                throw new common_1.UnauthorizedException({
                    code: 1006,
                    message: '账号已锁定，请稍后重试',
                });
            }
            throw new common_1.UnauthorizedException({
                code: 1001,
                message: '用户名或密码错误',
            });
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                loginFailCount: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
            },
        });
        const payload = {
            userId: Number(user.id),
            tenantId: user.tenantId ? Number(user.tenantId) : null,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
        });
        const refreshExpire = 7 * 24 * 60 * 60;
        await this.redis.setex(`refresh:${user.id}`, refreshExpire, refreshToken);
        this.logger.log(`用户登录成功 - userId: ${user.id}, username: ${user.username}, role: ${user.role}`);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
    async getUserInfo(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                realName: true,
                phone: true,
                role: true,
                tenantId: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException({
                code: 1002,
                message: '资源不存在',
            });
        }
        let tenantName;
        if (user.tenantId) {
            const tenant = await this.prisma.company.findUnique({
                where: { id: user.tenantId },
                select: { name: true },
            });
            tenantName = tenant?.name;
        }
        return {
            ...user,
            tenantName,
        };
    }
    async logout(accessToken, userId) {
        try {
            const decoded = this.jwtService.verify(accessToken);
            const ttl = decoded.exp - Math.floor(Date.now() / 1000);
            if (ttl > 0) {
                await this.redis.setex(`blacklist:${userId}:${decoded.iat}`, ttl, '1');
            }
            await this.redis.del(`refresh:${userId}`);
            this.logger.log(`用户登出 - userId: ${userId}`);
            return { code: 0, message: 'success' };
        }
        catch (error) {
            return { code: 0, message: 'success' };
        }
    }
    async refresh(refreshTokenDto) {
        const { refresh_token } = refreshTokenDto;
        try {
            const decoded = this.jwtService.verify(refresh_token);
            const userId = decoded.userId;
            const storedToken = await this.redis.get(`refresh:${userId}`);
            if (!storedToken || storedToken !== refresh_token) {
                throw new common_1.UnauthorizedException({
                    code: 1004,
                    message: 'Token 已失效',
                });
            }
            const payload = {
                userId: decoded.userId,
                tenantId: decoded.tenantId,
                role: decoded.role,
            };
            const accessToken = this.jwtService.sign(payload);
            return {
                access_token: accessToken,
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException({
                code: 1005,
                message: 'Token 已过期',
            });
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map