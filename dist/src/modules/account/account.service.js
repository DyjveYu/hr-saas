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
exports.AccountService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let AccountService = class AccountService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBalance(tenantId) {
        const account = await this.prisma.account.findUnique({
            where: { tenantId },
        });
        if (!account) {
            throw new common_1.NotFoundException({ code: 1002, message: '账户不存在' });
        }
        return {
            balance: account.balance.toString(),
            status: account.status,
        };
    }
    async changeStatus(tenantId, status, role) {
        if (role !== 'PLATFORM_ADMIN') {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限操作' });
        }
        const account = await this.prisma.account.findUnique({
            where: { tenantId },
        });
        if (!account) {
            throw new common_1.NotFoundException({ code: 1002, message: '账户不存在' });
        }
        return this.prisma.account.update({
            where: { tenantId },
            data: { status: status },
        });
    }
};
exports.AccountService = AccountService;
exports.AccountService = AccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountService);
//# sourceMappingURL=account.service.js.map