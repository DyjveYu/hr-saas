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
exports.FileController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const file_service_1 = require("./file.service");
const file_dto_1 = require("./dto/file.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let FileController = class FileController {
    fileService;
    constructor(fileService) {
        this.fileService = fileService;
    }
    async getPresignUrl(dto, user) {
        const result = await this.fileService.getPresignUrl(dto, user.tenantId);
        return { code: 0, message: 'success', data: result };
    }
    async getSignedUrl(dto, user) {
        const result = await this.fileService.getSignedUrl(dto, user.tenantId, user.role);
        return { code: 0, message: 'success', data: result };
    }
};
exports.FileController = FileController;
__decorate([
    (0, common_1.Post)('presign'),
    (0, swagger_1.ApiOperation)({ summary: '获取上传凭证', description: '获取OSS预签名上传URL' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '获取成功' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_dto_1.GetPresignDto, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getPresignUrl", null);
__decorate([
    (0, common_1.Get)('signed-url'),
    (0, swagger_1.ApiOperation)({ summary: '获取私有文件访问URL', description: '获取OSS预签名下载URL（用于访问敏感文件）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_dto_1.GetSignedUrlDto, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getSignedUrl", null);
exports.FileController = FileController = __decorate([
    (0, swagger_1.ApiTags)('文件模块'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [file_service_1.FileService])
], FileController);
//# sourceMappingURL=file.controller.js.map