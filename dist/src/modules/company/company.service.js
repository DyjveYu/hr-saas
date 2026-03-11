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
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let CompanyService = class CompanyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query, role) {
        if (role !== 'PLATFORM_ADMIN') {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限访问' });
        }
        const { page = 1, pageSize = 10, name, status } = query;
        const skip = (page - 1) * pageSize;
        const where = {};
        if (name) {
            where.name = { contains: name };
        }
        if (status) {
            where.status = status;
        }
        const [list, total] = await Promise.all([
            this.prisma.company.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.company.count({ where }),
        ]);
        return {
            list,
            total,
            page,
            pageSize,
        };
    }
    async create(createCompanyDto, userId, role) {
        if (role !== 'PLATFORM_ADMIN') {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限创建公司' });
        }
        const company = await this.prisma.company.create({
            data: {
                name: createCompanyDto.name,
                shortName: createCompanyDto.shortName,
                contactName: createCompanyDto.contactName,
                contactPhone: createCompanyDto.contactPhone,
                contactEmail: createCompanyDto.contactEmail,
                address: createCompanyDto.address,
                createdBy: userId,
            },
        });
        await this.prisma.account.create({
            data: {
                tenantId: company.id,
                balance: 0,
                status: 'ACTIVE',
            },
        });
        if (createCompanyDto.adminUsername &&
            createCompanyDto.adminPassword &&
            createCompanyDto.adminRealName &&
            createCompanyDto.adminPhone) {
            const hashedPassword = await bcrypt.hash(createCompanyDto.adminPassword, 10);
            await this.prisma.user.create({
                data: {
                    tenantId: company.id,
                    username: createCompanyDto.adminUsername,
                    password: hashedPassword,
                    realName: createCompanyDto.adminRealName,
                    phone: createCompanyDto.adminPhone,
                    role: 'COMPANY_ADMIN',
                    status: 'ACTIVE',
                },
            });
        }
        return company;
    }
    async findById(id, role, tenantId) {
        const company = await this.prisma.company.findUnique({
            where: { id },
        });
        if (!company) {
            throw new common_1.NotFoundException({ code: 1002, message: '公司不存在' });
        }
        if (role === 'COMPANY_ADMIN' && tenantId !== id) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限查看' });
        }
        return company;
    }
    async update(id, updateCompanyDto, role, tenantId) {
        const company = await this.prisma.company.findUnique({ where: { id } });
        if (!company) {
            throw new common_1.NotFoundException({ code: 1002, message: '公司不存在' });
        }
        if (role === 'PLATFORM_ADMIN') {
            return this.prisma.company.update({
                where: { id },
                data: {
                    name: updateCompanyDto.name,
                    shortName: updateCompanyDto.shortName,
                    contactName: updateCompanyDto.contactName,
                    contactPhone: updateCompanyDto.contactPhone,
                    contactEmail: updateCompanyDto.contactEmail,
                    address: updateCompanyDto.address,
                },
            });
        }
        if (role === 'COMPANY_ADMIN' && tenantId !== id) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限编辑' });
        }
        return this.prisma.company.update({
            where: { id },
            data: {
                name: updateCompanyDto.name,
                shortName: updateCompanyDto.shortName,
                contactName: updateCompanyDto.contactName,
                contactPhone: updateCompanyDto.contactPhone,
                contactEmail: updateCompanyDto.contactEmail,
                address: updateCompanyDto.address,
            },
        });
    }
    async changeStatus(id, dto, role) {
        if (role !== 'PLATFORM_ADMIN') {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限操作' });
        }
        const company = await this.prisma.company.findUnique({ where: { id } });
        if (!company) {
            throw new common_1.NotFoundException({ code: 1002, message: '公司不存在' });
        }
        return this.prisma.company.update({
            where: { id },
            data: { status: dto.status },
        });
    }
    async getOverview(id, role, tenantId) {
        const company = await this.prisma.company.findUnique({ where: { id } });
        if (!company) {
            throw new common_1.NotFoundException({ code: 1002, message: '公司不存在' });
        }
        if (role === 'COMPANY_ADMIN' && tenantId !== id) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限查看' });
        }
        const [projectCount, account, recentRecharges] = await Promise.all([
            this.prisma.project.count({ where: { tenantId: id } }),
            this.prisma.account.findUnique({ where: { tenantId: id } }),
            this.prisma.rechargeOrder.findMany({
                where: { tenantId: id },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
        ]);
        return {
            companyId: id,
            companyName: company.name,
            projectCount,
            balance: account?.balance || 0,
            accountStatus: account?.status || 'ACTIVE',
            recentRecharges,
        };
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyService);
//# sourceMappingURL=company.service.js.map