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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const file_service_1 = require("../file/file.service");
const uuid_1 = require("uuid");
let ProjectService = class ProjectService {
    prisma;
    fileService;
    constructor(prisma, fileService) {
        this.prisma = prisma;
        this.fileService = fileService;
    }
    async findAll(query, tenantId, role) {
        if (role === 'PLATFORM_ADMIN') {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限访问' });
        }
        const { page = 1, pageSize = 10, name, status } = query;
        const skip = (page - 1) * pageSize;
        const where = {
            tenantId,
        };
        if (name) {
            where.name = { contains: name };
        }
        if (status) {
            where.status = status;
        }
        const [list, total] = await Promise.all([
            this.prisma.project.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.project.count({ where }),
        ]);
        return {
            list,
            total,
            page,
            pageSize,
        };
    }
    async create(createProjectDto, tenantId, userId, role) {
        if (role === 'PLATFORM_ADMIN') {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限创建项目' });
        }
        const qrCodeToken = (0, uuid_1.v4)();
        const project = await this.prisma.project.create({
            data: {
                tenantId: tenantId,
                name: createProjectDto.name,
                capacity: createProjectDto.capacity,
                siteManager: createProjectDto.siteManager,
                siteManagerPhone: createProjectDto.siteManagerPhone,
                financeManager: createProjectDto.financeManager,
                financeManagerPhone: createProjectDto.financeManagerPhone,
                qrCodeToken,
                createdBy: userId,
            },
        });
        const { qrCodeUrl } = await this.fileService.generateProjectQrCode(Number(project.id), tenantId);
        return {
            ...project,
            qrCodeUrl,
        };
    }
    async findById(id, tenantId, role) {
        const project = await this.prisma.project.findUnique({
            where: { id },
        });
        if (!project) {
            throw new common_1.NotFoundException({ code: 1002, message: '项目不存在' });
        }
        if (role === 'PLATFORM_ADMIN') {
            return project;
        }
        if (Number(project.tenantId) !== tenantId) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限查看' });
        }
        return project;
    }
    async update(id, updateProjectDto, tenantId, role) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException({ code: 1002, message: '项目不存在' });
        }
        if (role !== 'PLATFORM_ADMIN' && Number(project.tenantId) !== tenantId) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限编辑' });
        }
        return this.prisma.project.update({
            where: { id },
            data: {
                name: updateProjectDto.name,
                capacity: updateProjectDto.capacity,
                siteManager: updateProjectDto.siteManager,
                siteManagerPhone: updateProjectDto.siteManagerPhone,
                financeManager: updateProjectDto.financeManager,
                financeManagerPhone: updateProjectDto.financeManagerPhone,
            },
        });
    }
    async changeStatus(id, dto, tenantId, role) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException({ code: 1002, message: '项目不存在' });
        }
        if (role !== 'PLATFORM_ADMIN' && Number(project.tenantId) !== tenantId) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限操作' });
        }
        return this.prisma.project.update({
            where: { id },
            data: { status: dto.status },
        });
    }
    async remove(id, tenantId, role) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException({ code: 1002, message: '项目不存在' });
        }
        if (role !== 'PLATFORM_ADMIN' && Number(project.tenantId) !== tenantId) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限删除' });
        }
        return this.prisma.project.update({
            where: { id },
            data: { status: 'INACTIVE' },
        });
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        file_service_1.FileService])
], ProjectService);
//# sourceMappingURL=project.service.js.map