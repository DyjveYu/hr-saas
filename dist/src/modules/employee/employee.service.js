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
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let EmployeeService = class EmployeeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query, tenantId) {
        const { page = 1, pageSize = 10, name, projectId, status } = query;
        const skip = (page - 1) * pageSize;
        const where = {
            tenantId,
        };
        if (name) {
            where.name = { contains: name };
        }
        if (projectId) {
            where.projectId = projectId;
        }
        if (status) {
            where.status = status;
        }
        const [list, total] = await Promise.all([
            this.prisma.employee.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    project: {
                        select: { id: true, name: true },
                    },
                },
            }),
            this.prisma.employee.count({ where }),
        ]);
        return {
            list,
            total,
            page,
            pageSize,
        };
    }
    async create(createEmployeeDto, tenantId, userId) {
        const existing = await this.prisma.employee.findFirst({
            where: {
                tenantId,
                idCard: createEmployeeDto.idCard,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException({ code: 2003, message: '该身份证号码已在当前企业存在' });
        }
        const employee = await this.prisma.employee.create({
            data: {
                tenantId,
                name: createEmployeeDto.name,
                idCard: createEmployeeDto.idCard,
                phone: createEmployeeDto.phone,
                projectId: createEmployeeDto.projectId,
                emergencyContact: createEmployeeDto.emergencyContact,
                emergencyPhone: createEmployeeDto.emergencyPhone,
                remark: createEmployeeDto.remark,
                status: 'PENDING',
                createdBy: userId,
            },
        });
        return employee;
    }
    async findById(id, tenantId) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                project: {
                    select: { id: true, name: true },
                },
            },
        });
        if (!employee) {
            throw new common_1.NotFoundException({ code: 1002, message: '员工不存在' });
        }
        if (Number(employee.tenantId) !== tenantId) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限查看' });
        }
        return employee;
    }
    async update(id, updateEmployeeDto, tenantId) {
        const employee = await this.prisma.employee.findUnique({ where: { id } });
        if (!employee) {
            throw new common_1.NotFoundException({ code: 1002, message: '员工不存在' });
        }
        if (Number(employee.tenantId) !== tenantId) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限编辑' });
        }
        return this.prisma.employee.update({
            where: { id },
            data: {
                name: updateEmployeeDto.name,
                phone: updateEmployeeDto.phone,
                emergencyContact: updateEmployeeDto.emergencyContact,
                emergencyPhone: updateEmployeeDto.emergencyPhone,
                remark: updateEmployeeDto.remark,
            },
        });
    }
    async remove(id, tenantId) {
        const employee = await this.prisma.employee.findUnique({ where: { id } });
        if (!employee) {
            throw new common_1.NotFoundException({ code: 1002, message: '员工不存在' });
        }
        if (Number(employee.tenantId) !== tenantId) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限删除' });
        }
        return this.prisma.employee.update({
            where: { id },
            data: { status: 'DISMISSED' },
        });
    }
    async changeStatus(id, dto, tenantId) {
        const employee = await this.prisma.employee.findUnique({ where: { id } });
        if (!employee) {
            throw new common_1.NotFoundException({ code: 1002, message: '员工不存在' });
        }
        if (Number(employee.tenantId) !== tenantId) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限操作' });
        }
        const isValid = this.checkStatusTransition(employee.status, dto.status);
        if (!isValid) {
            throw new common_1.BadRequestException({ code: 2004, message: '不符合状态流转规则' });
        }
        return this.prisma.employee.update({
            where: { id },
            data: { status: dto.status },
        });
    }
    async assignProject(id, dto, tenantId) {
        const employee = await this.prisma.employee.findUnique({ where: { id } });
        if (!employee) {
            throw new common_1.NotFoundException({ code: 1002, message: '员工不存在' });
        }
        if (Number(employee.tenantId) !== tenantId) {
            throw new common_1.ForbiddenException({ code: 1003, message: '无权限操作' });
        }
        const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
        if (!project) {
            throw new common_1.NotFoundException({ code: 1002, message: '项目不存在' });
        }
        if (Number(project.tenantId) !== tenantId) {
            throw new common_1.ForbiddenException({ code: 1003, message: '项目不属于当前企业' });
        }
        return this.prisma.employee.update({
            where: { id },
            data: {
                projectId: dto.projectId,
                status: 'ACTIVE',
            },
        });
    }
    checkStatusTransition(current, next) {
        const transitions = {
            PENDING: ['ACTIVE'],
            ACTIVE: ['PENDING_EXIT', 'FIRED', 'DISMISSED'],
            PENDING_EXIT: ['RESIGNED', 'FIRED'],
            RESIGNED: [],
            FIRED: [],
            DISMISSED: [],
        };
        return transitions[current]?.includes(next) ?? false;
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeeService);
//# sourceMappingURL=employee.service.js.map