"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let TransactionService = class TransactionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query, tenantId, role) {
        const { page = 1, pageSize = 10, type, direction, startDate, endDate, tenantId: filterTenantId } = query;
        const skip = (page - 1) * pageSize;
        const where = {};
        if (role === 'COMPANY_ADMIN') {
            if (filterTenantId && filterTenantId !== tenantId) {
                throw new common_1.ForbiddenException({ code: 1003, message: '无权限查看其他企业的流水' });
            }
            where.tenantId = tenantId;
        }
        else if (role === 'PLATFORM_ADMIN' && filterTenantId) {
            where.tenantId = filterTenantId;
        }
        if (type) {
            where.type = type;
        }
        if (direction) {
            where.direction = direction;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }
        const [list, total] = await Promise.all([
            this.prisma.transactionRecord.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    tenantId: true,
                    type: true,
                    amount: true,
                    direction: true,
                    beforeBalance: true,
                    afterBalance: true,
                    referenceNo: true,
                    operatorId: true,
                    remark: true,
                    createdAt: true,
                },
            }),
            this.prisma.transactionRecord.count({ where }),
        ]);
        return {
            list,
            total,
            page,
            pageSize,
        };
    }
    async findById(id, tenantId, role) {
        const transaction = await this.prisma.transactionRecord.findUnique({
            where: { id },
            select: {
                id: true,
                tenantId: true,
                type: true,
                amount: true,
                direction: true,
                beforeBalance: true,
                afterBalance: true,
                referenceId: true,
                referenceNo: true,
                operatorId: true,
                remark: true,
                createdAt: true,
            },
        });
        if (!transaction) {
            throw new common_1.NotFoundException({ code: 1002, message: '流水记录不存在' });
        }
        if (role === 'COMPANY_ADMIN' && Number(transaction.tenantId) !== tenantId) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限查看' });
        }
        return transaction;
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map