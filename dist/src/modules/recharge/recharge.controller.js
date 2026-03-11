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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RechargeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const recharge_service_1 = require("./recharge.service");
const recharge_dto_1 = require("./dto/recharge.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let RechargeController = class RechargeController {
    rechargeService;
    constructor(rechargeService) {
        this.rechargeService = rechargeService;
    }
    async create(dto, user) {
        const result = await this.rechargeService.create(dto, user.tenantId, user.userId);
        return { code: 0, message: 'success', data: result };
    }
    async complete(id, user) {
        const result = await this.rechargeService.complete(id, user.role);
        return { code: 0, message: 'success', data: result };
    }
    async findAll(query, user) {
        const result = await this.rechargeService.findAll(query, user.tenantId, user.role);
        return { code: 0, message: 'success', data: result };
    }
};
exports.RechargeController = RechargeController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建充值申请', description: '企业管理员提交充值申请' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '创建成功' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recharge_dto_1.CreateRechargeOrderDto, Object]),
    __metadata("design:returntype", Promise)
], RechargeController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: '确认充值到账', description: '平台管理员确认充值到账，更新账户余额' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '确认成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RechargeController.prototype, "complete", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取充值记录列表', description: '分页获取充值记录列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recharge_dto_1.QueryRechargeOrderDto, Object]),
    __metadata("design:returntype", Promise)
], RechargeController.prototype, "findAll", null);
exports.RechargeController = RechargeController = __decorate([
    (0, swagger_1.ApiTags)('充值模块'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('recharge-orders'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [recharge_service_1.RechargeService])
], RechargeController);
//# sourceMappingURL=recharge.controller.js.map