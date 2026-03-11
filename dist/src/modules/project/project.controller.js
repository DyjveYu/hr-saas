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
exports.ProjectController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const project_service_1 = require("./project.service");
const project_dto_1 = require("./dto/project.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ProjectController = class ProjectController {
    projectService;
    constructor(projectService) {
        this.projectService = projectService;
    }
    async findAll(query, user) {
        const result = await this.projectService.findAll(query, user.tenantId, user.role);
        return { code: 0, message: 'success', data: result };
    }
    async create(createProjectDto, user) {
        const result = await this.projectService.create(createProjectDto, user.tenantId, user.userId, user.role);
        return { code: 0, message: 'success', data: result };
    }
    async findById(id, user) {
        const result = await this.projectService.findById(id, user.tenantId, user.role);
        return { code: 0, message: 'success', data: result };
    }
    async update(id, updateProjectDto, user) {
        const result = await this.projectService.update(id, updateProjectDto, user.tenantId, user.role);
        return { code: 0, message: 'success', data: result };
    }
    async changeStatus(id, dto, user) {
        const result = await this.projectService.changeStatus(id, dto, user.tenantId, user.role);
        return { code: 0, message: 'success', data: result };
    }
    async remove(id, user) {
        const result = await this.projectService.remove(id, user.tenantId, user.role);
        return { code: 0, message: 'success', data: result };
    }
};
exports.ProjectController = ProjectController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取项目列表', description: '分页获取项目列表，仅企业管理员可访问' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_dto_1.QueryProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建项目', description: '创建新项目，仅企业管理员可操作' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '创建成功' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_dto_1.CreateProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取项目详情', description: '获取指定项目的详细信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '编辑项目', description: '更新项目信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '编辑成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, project_dto_1.UpdateProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: '项目启停', description: '启用或停用项目' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '操作成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, project_dto_1.ChangeProjectStatusDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除项目', description: '软删除项目' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "remove", null);
exports.ProjectController = ProjectController = __decorate([
    (0, swagger_1.ApiTags)('项目管理模块'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('projects'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [project_service_1.ProjectService])
], ProjectController);
//# sourceMappingURL=project.controller.js.map