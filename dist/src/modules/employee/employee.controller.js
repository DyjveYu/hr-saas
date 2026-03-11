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
exports.EmployeeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const employee_service_1 = require("./employee.service");
const employee_dto_1 = require("./dto/employee.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let EmployeeController = class EmployeeController {
    employeeService;
    constructor(employeeService) {
        this.employeeService = employeeService;
    }
    async findAll(query, user) {
        const result = await this.employeeService.findAll(query, user.tenantId);
        return { code: 0, message: 'success', data: result };
    }
    async create(createEmployeeDto, user) {
        const result = await this.employeeService.create(createEmployeeDto, user.tenantId, user.userId);
        return { code: 0, message: 'success', data: result };
    }
    async findById(id, user) {
        const result = await this.employeeService.findById(id, user.tenantId);
        return { code: 0, message: 'success', data: result };
    }
    async update(id, updateEmployeeDto, user) {
        const result = await this.employeeService.update(id, updateEmployeeDto, user.tenantId);
        return { code: 0, message: 'success', data: result };
    }
    async remove(id, user) {
        const result = await this.employeeService.remove(id, user.tenantId);
        return { code: 0, message: 'success', data: result };
    }
    async changeStatus(id, dto, user) {
        const result = await this.employeeService.changeStatus(id, dto, user.tenantId);
        return { code: 0, message: 'success', data: result };
    }
    async assignProject(id, dto, user) {
        const result = await this.employeeService.assignProject(id, dto, user.tenantId);
        return { code: 0, message: 'success', data: result };
    }
};
exports.EmployeeController = EmployeeController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取员工列表', description: '分页获取员工列表，支持按姓名/项目/状态筛选' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employee_dto_1.QueryEmployeeDto, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建员工', description: '创建新员工' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '创建成功' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employee_dto_1.CreateEmployeeDto, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取员工详情', description: '获取指定员工的详细信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '编辑员工', description: '更新员工信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '编辑成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, employee_dto_1.UpdateEmployeeDto, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除员工', description: '软删除员工（状态改为DISMISSED）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: '变更员工状态', description: '变更员工在职状态（PENDING->ACTIVE->PENDING_EXIT->RESIGNED等）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '变更成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, employee_dto_1.ChangeEmployeeStatusDto, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Patch)(':id/project'),
    (0, swagger_1.ApiOperation)({ summary: '分配项目', description: '为员工分配所属项目' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '分配成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, employee_dto_1.AssignProjectDto, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "assignProject", null);
exports.EmployeeController = EmployeeController = __decorate([
    (0, swagger_1.ApiTags)('员工管理模块'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('employees'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [employee_service_1.EmployeeService])
], EmployeeController);
//# sourceMappingURL=employee.controller.js.map