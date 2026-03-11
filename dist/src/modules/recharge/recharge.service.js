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
exports.RechargeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
function generateOrderNo() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `RC${yyyy}${mm}${dd}${random}`;
}
let RechargeService = class RechargeService {
    prisma;
    logger = new common_1.Logger('RechargeModule');
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, tenantId, userId) {
        const existingPending = await this.prisma.rechargeOrder.findFirst({
            where: {
                tenantId,
                status: 'PENDING',
            },
        });
        if (existingPending) {
            throw new common_1.BadRequestException({ code: 2006, message: '已有待处理的充值申请，请勿重复提交' });
        }
        const orderNo = generateOrderNo();
        const rechargeOrder = await this.prisma.rechargeOrder.create({
            data: {
                tenantId,
                orderNo,
                amount: dto.amount,
                transferVoucherUrl: dto.transferVoucherUrl,
                remark: dto.remark,
                status: 'PENDING',
                createdBy: userId,
            },
        });
        this.logger.log(`充值申请创建 - userId: ${userId}, tenantId: ${tenantId}, orderNo: ${orderNo}, amount: ${dto.amount}`);
        return rechargeOrder;
    }
    async complete(id, role) {
        if (role !== 'PLATFORM_ADMIN') {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限操作' });
        }
        const rechargeOrder = await this.prisma.rechargeOrder.findUnique({
            where: { id },
        });
        if (!rechargeOrder) {
            throw new common_1.NotFoundException({ code: 1002, message: '充值订单不存在' });
        }
        if (rechargeOrder.status !== 'PENDING') {
            throw new common_1.BadRequestException({ code: 2007, message: '订单状态不是待处理' });
        }
        const result = await this.prisma.$transaction(async (tx) => {
            await tx.rechargeOrder.update({
                where: { id },
                data: { status: 'COMPLETED' },
            });
            const account = await tx.account.findUnique({
                where: { tenantId: rechargeOrder.tenantId },
            });
            if (!account) {
                throw new common_1.NotFoundException({ code: 1002, message: '账户不存在' });
            }
            const newBalance = account.balance.plus(rechargeOrder.amount);
            await tx.account.update({
                where: { tenantId: rechargeOrder.tenantId },
                data: { balance: newBalance },
            });
            await tx.transactionRecord.create({
                data: {
                    tenantId: rechargeOrder.tenantId,
                    type: 'RECHARGE',
                    amount: rechargeOrder.amount,
                    direction: 'IN',
                    beforeBalance: account.balance,
                    afterBalance: newBalance,
                    referenceId: rechargeOrder.id,
                    referenceNo: rechargeOrder.orderNo,
                    operatorId: undefined,
                },
            });
            return {
                rechargeOrder: await tx.rechargeOrder.findUnique({ where: { id } }),
                newBalance,
            };
        });
        this.logger.log(`充值确认到账 - orderNo: ${rechargeOrder.orderNo}, amount: ${rechargeOrder.amount}, newBalance: ${result.newBalance}`);
        return result.rechargeOrder;
    }
    async findAll(query, tenantId, role) {
        const { page = 1, pageSize = 10, tenantId: filterTenantId, status } = query;
        const skip = (page - 1) * pageSize;
        const where = {};
        if (role === 'COMPANY_ADMIN') {
            if (filterTenantId && filterTenantId !== tenantId) {
                throw new common_1.ForbiddenException({ code: 1003, message: '无权限查看其他企业的充值记录' });
            }
            where.tenantId = tenantId;
        }
        else if (role === 'PLATFORM_ADMIN' && filterTenantId) {
            where.tenantId = filterTenantId;
        }
        if (status) {
            where.status = status;
        }
        const [list, total] = await Promise.all([
            this.prisma.rechargeOrder.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    company: {
                        select: { id: true, name: true },
                    },
                },
            }),
            this.prisma.rechargeOrder.count({ where }),
        ]);
        return {
            list,
            total,
            page,
            pageSize,
        };
    }
};
exports.RechargeService = RechargeService;
exports.RechargeService = RechargeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RechargeService);
//# sourceMappingURL=recharge.service.js.map