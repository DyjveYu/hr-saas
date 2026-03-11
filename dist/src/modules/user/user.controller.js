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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_service_1 = require("./user.service");
const user_dto_1 = require("./dto/user.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async findAll(user) {
        const users = await this.userService.findAll(user.tenantId, user.role);
        return { code: 0, message: 'success', data: users };
    }
    async create(createUserDto, user) {
        const result = await this.userService.create(createUserDto, user.tenantId, user.role);
        return { code: 0, message: 'success', data: result };
    }
    async update(id, updateUserDto, user) {
        const result = await this.userService.update(id, updateUserDto, user.tenantId, user.role);
        return { code: 0, message: 'success', data: result };
    }
    async remove(id, user) {
        const result = await this.userService.remove(id, user.tenantId, user.role);
        return { code: 0, message: 'success', data: result };
    }
    async changePassword(id, dto, user) {
        const result = await this.userService.changePassword(id, dto, user.tenantId, user.role);
        return { code: 0, message: 'success', data: result };
    }
    async setPaymentPassword(id, dto, user) {
        const result = await this.userService.setPaymentPassword(id, dto, user.tenantId, user.role);
        return { code: 0, message: 'success', data: result };
    }
    async changeStatus(id, dto, user) {
        const result = await this.userService.changeStatus(id, dto, user.tenantId, user.role);
        return { code: 0, message: 'success', data: result };
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取账号列表', description: 'PLATFORM_ADMIN查看所有账号，COMPANY_ADMIN查看本企业账号' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建账号', description: '创建新的用户账号' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '创建成功' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '修改账号', description: '更新用户账号信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '修改成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除账号', description: '软删除账号（禁用账号）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/password'),
    (0, swagger_1.ApiOperation)({ summary: '修改登录密码', description: '修改用户登录密码' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '修改成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_dto_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Patch)(':id/payment-password'),
    (0, swagger_1.ApiOperation)({ summary: '设置支付密码', description: '设置或修改支付密码' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '设置成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_dto_1.SetPaymentPasswordDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "setPaymentPassword", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: '账号启停', description: '启用或禁用账号' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '操作成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_dto_1.ChangeStatusDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changeStatus", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('用户账号模块'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map