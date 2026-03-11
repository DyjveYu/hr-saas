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
exports.CompanyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const company_service_1 = require("./company.service");
const company_dto_1 = require("./dto/company.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CompanyController = class CompanyController {
    companyService;
    constructor(companyService) {
        this.companyService = companyService;
    }
    async findAll(query, user) {
        const result = await this.companyService.findAll(query, user.role);
        return { code: 0, message: 'success', data: result };
    }
    async create(createCompanyDto, user) {
        const result = await this.companyService.create(createCompanyDto, user.userId, user.role);
        return { code: 0, message: 'success', data: result };
    }
    async findById(id, user) {
        const result = await this.companyService.findById(id, user.role, user.tenantId);
        return { code: 0, message: 'success', data: result };
    }
    async update(id, updateCompanyDto, user) {
        const result = await this.companyService.update(id, updateCompanyDto, user.role, user.tenantId);
        return { code: 0, message: 'success', data: result };
    }
    async changeStatus(id, dto, user) {
        const result = await this.companyService.changeStatus(id, dto, user.role);
        return { code: 0, message: 'success', data: result };
    }
    async getOverview(id, user) {
        const result = await this.companyService.getOverview(id, user.role, user.tenantId);
        return { code: 0, message: 'success', data: result };
    }
};
exports.CompanyController = CompanyController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取公司列表', description: '分页获取公司列表，仅平台管理员可访问' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [company_dto_1.QueryCompanyDto, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建公司', description: '创建新公司，仅平台管理员可操作' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '创建成功' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [company_dto_1.CreateCompanyDto, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取公司详情', description: '获取指定公司的详细信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '编辑公司', description: '更新公司信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '编辑成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, company_dto_1.UpdateCompanyDto, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: '启停公司', description: '启用或停用公司，仅平台管理员可操作' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '操作成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, company_dto_1.ChangeCompanyStatusDto, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Get)(':id/overview'),
    (0, swagger_1.ApiOperation)({ summary: '获取公司内部数据', description: '查看公司的项目数量、账户余额、充值流水等' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getOverview", null);
exports.CompanyController = CompanyController = __decorate([
    (0, swagger_1.ApiTags)('企业管理模块'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('companies'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [company_service_1.CompanyService])
], CompanyController);
//# sourceMappingURL=company.controller.js.map