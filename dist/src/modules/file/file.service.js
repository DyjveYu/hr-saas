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
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let FileService = class FileService {
    configService;
    prisma;
    ossEnabled;
    bucket;
    endpoint;
    region;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.ossEnabled = !!(this.configService.get('OSS_ACCESS_KEY') &&
            this.configService.get('OSS_SECRET_KEY') &&
            this.configService.get('OSS_BUCKET') &&
            this.configService.get('OSS_REGION'));
        this.bucket = this.configService.get('OSS_BUCKET') || '';
        this.endpoint = this.configService.get('OSS_ENDPOINT') || '';
        this.region = this.configService.get('OSS_REGION') || '';
    }
    async getPresignUrl(dto, tenantId) {
        const { fileType, bizId } = dto;
        const timestamp = Date.now();
        const ext = 'jpg';
        const env = this.configService.get('NODE_ENV') || 'dev';
        const fileKey = `${env}/${fileType}/${tenantId}/${bizId}/${timestamp}.${ext}`;
        if (!this.ossEnabled) {
            return {
                uploadUrl: `http://localhost:3000/api/files/mock-upload?key=${fileKey}`,
                fileKey,
                expires: 600,
                isMock: true,
            };
        }
        return {
            uploadUrl: `https://${this.bucket}.${this.endpoint}/${fileKey}?mock=true`,
            fileKey,
            expires: 600,
            isMock: false,
        };
    }
    async getSignedUrl(dto, tenantId, role) {
        const { fileKey } = dto;
        await this.checkFileAccessPermission(fileKey, tenantId, role);
        if (!this.ossEnabled) {
            return {
                signedUrl: `http://localhost:3000/api/files/mock-download?key=${fileKey}`,
                expires: 300,
                isMock: true,
            };
        }
        return {
            signedUrl: `https://${this.bucket}.${this.endpoint}/${fileKey}?mock=true`,
            expires: 300,
            isMock: false,
        };
    }
    async checkFileAccessPermission(fileKey, tenantId, role) {
        if (role === 'PLATFORM_ADMIN') {
            return;
        }
        const parts = fileKey.split('/');
        if (parts.length < 4) {
            throw new common_1.BadRequestException({ code: 2005, message: '无效的文件 key' });
        }
        const fileTenantId = parseInt(parts[2], 10);
        if (parts[1]?.startsWith('id_card')) {
            if (fileTenantId !== tenantId) {
                throw new common_1.ForbiddenException({ code: 1003, message: '无权限访问该文件' });
            }
        }
        if (fileTenantId !== tenantId) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限访问该文件' });
        }
    }
    async generateProjectQrCode(projectId, tenantId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.BadRequestException({ code: 1002, message: '项目不存在' });
        }
        if (Number(project.tenantId) !== tenantId) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限操作' });
        }
        const env = this.configService.get('NODE_ENV') || 'dev';
        const qrCodeUrl = `https://mock-oss.example.com/${env}/qrcode/${tenantId}/${projectId}/qrcode.png`;
        await this.prisma.project.update({
            where: { id: projectId },
            data: { qrCodeUrl },
        });
        return { qrCodeUrl };
    }
};
exports.FileService = FileService;
exports.FileService = FileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], FileService);
//# sourceMappingURL=file.service.js.map