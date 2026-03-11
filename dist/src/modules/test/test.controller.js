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
exports.TestController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const test_service_1 = require("./test.service");
let TestController = class TestController {
    testService;
    constructor(testService) {
        this.testService = testService;
    }
    async getCompanies() {
        const companies = await this.testService.findCompanies();
        return {
            code: 0,
            message: 'success',
            data: companies,
        };
    }
    async getProjects(user) {
        const projects = await this.testService.findProjects(user.tenantId);
        return {
            code: 0,
            message: 'success',
            data: projects,
        };
    }
    async createProject(user, body) {
        const project = await this.testService.createProject(user.tenantId, body.name);
        return {
            code: 0,
            message: 'success',
            data: project,
        };
    }
    async getProject(user, id) {
        const projectId = parseInt(id, 10);
        const project = await this.testService.findProject(user.tenantId, projectId);
        if (!project) {
            return {
                code: 1002,
                message: '资源不存在',
                data: null,
            };
        }
        return {
            code: 0,
            message: 'success',
            data: project,
        };
    }
    getPublic() {
        return {
            code: 0,
            message: 'success',
            data: { message: '公开接口' },
        };
    }
};
exports.TestController = TestController;
__decorate([
    (0, common_1.Get)('companies'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestController.prototype, "getCompanies", null);
__decorate([
    (0, common_1.Get)('projects'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('COMPANY_ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "getProjects", null);
__decorate([
    (0, common_1.Post)('projects'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('COMPANY_ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "createProject", null);
__decorate([
    (0, common_1.Get)('projects/:id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('COMPANY_ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "getProject", null);
__decorate([
    (0, common_1.Get)('public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TestController.prototype, "getPublic", null);
exports.TestController = TestController = __decorate([
    (0, common_1.Controller)('test'),
    __metadata("design:paramtypes", [test_service_1.TestService])
], TestController);
//# sourceMappingURL=test.controller.js.map