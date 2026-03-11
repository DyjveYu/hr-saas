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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, role) {
        const where = {};
        if (role === 'COMPANY_ADMIN' && tenantId !== null) {
            where.tenantId = tenantId;
        }
        return this.prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                role: true,
                realName: true,
                phone: true,
                status: true,
                tenantId: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(createUserDto, currentUserTenantId, currentUserRole) {
        const existing = await this.prisma.user.findUnique({
            where: { username: createUserDto.username },
        });
        if (existing) {
            throw new common_1.BadRequestException({ code: 2010, message: '用户名已存在' });
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        let tenantId = createUserDto.tenantId;
        if (currentUserRole === 'COMPANY_ADMIN') {
            if (createUserDto.tenantId && createUserDto.tenantId !== currentUserTenantId) {
                throw new common_1.ForbiddenException({ code: 1003, message: '无权限' });
            }
            tenantId = currentUserTenantId ?? undefined;
        }
        if (currentUserRole === 'PLATFORM_ADMIN' && !tenantId && createUserDto.role === 'PLATFORM_ADMIN') {
            tenantId = undefined;
        }
        const user = await this.prisma.user.create({
            data: {
                username: createUserDto.username,
                password: hashedPassword,
                role: createUserDto.role || 'COMPANY_ADMIN',
                realName: createUserDto.realName,
                phone: createUserDto.phone,
                tenantId,
            },
            select: {
                id: true,
                username: true,
                role: true,
                realName: true,
                phone: true,
                status: true,
                tenantId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async update(id, updateUserDto, currentUserTenantId, currentUserRole) {
        await this.checkPermission(id, currentUserTenantId, currentUserRole);
        return this.prisma.user.update({
            where: { id },
            data: {
                realName: updateUserDto.realName,
                phone: updateUserDto.phone,
            },
            select: {
                id: true,
                username: true,
                role: true,
                realName: true,
                phone: true,
                status: true,
                tenantId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async remove(id, currentUserTenantId, currentUserRole) {
        await this.checkPermission(id, currentUserTenantId, currentUserRole);
        return this.prisma.user.update({
            where: { id },
            data: { status: 'DISABLED' },
            select: {
                id: true,
                username: true,
                status: true,
            },
        });
    }
    async changePassword(id, dto, currentUserTenantId, currentUserRole) {
        await this.checkPermission(id, currentUserTenantId, currentUserRole);
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException({ code: 1002, message: '用户不存在' });
        }
        const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isMatch) {
            throw new common_1.BadRequestException({ code: 2001, message: '原密码错误' });
        }
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
        return { message: '密码修改成功' };
    }
    async setPaymentPassword(id, dto, currentUserTenantId, currentUserRole) {
        await this.checkPermission(id, currentUserTenantId, currentUserRole);
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException({ code: 1002, message: '用户不存在' });
        }
        if (user.role !== 'COMPANY_ADMIN') {
            throw new common_1.BadRequestException({ code: 2002, message: '只有企业管理员才能设置支付密码' });
        }
        const hashedPaymentPassword = await bcrypt.hash(dto.paymentPassword, 10);
        await this.prisma.user.update({
            where: { id },
            data: { paymentPassword: hashedPaymentPassword },
        });
        return { message: '支付密码设置成功' };
    }
    async changeStatus(id, dto, currentUserTenantId, currentUserRole) {
        await this.checkPermission(id, currentUserTenantId, currentUserRole);
        return this.prisma.user.update({
            where: { id },
            data: { status: dto.status },
            select: {
                id: true,
                username: true,
                status: true,
            },
        });
    }
    async checkPermission(targetUserId, currentUserTenantId, currentUserRole) {
        const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) {
            throw new common_1.NotFoundException({ code: 1002, message: '用户不存在' });
        }
        if (currentUserRole === 'PLATFORM_ADMIN') {
            return;
        }
        if (currentUserRole === 'COMPANY_ADMIN') {
            if (targetUser.tenantId !== currentUserTenantId) {
                throw new common_1.ForbiddenException({ code: 1003, message: '无权限操作其他企业的用户' });
            }
            return;
        }
        throw new common_1.ForbiddenException({ code: 1003, message: '无权限' });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map