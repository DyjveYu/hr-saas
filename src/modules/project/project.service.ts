import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FileService } from '../file/file.service';
import { CreateProjectDto, UpdateProjectDto, ChangeProjectStatusDto, QueryProjectDto } from './dto/project.dto';
import { ProjectStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}

  /**
   * 项目列表（分页，支持按名称筛选）
   * COMPANY_ADMIN 仅查本企业，PLATFORM_ADMIN 不能访问
   */
  async findAll(query: QueryProjectDto, tenantId: number | null, role: string) {
    // PLATFORM_ADMIN 不能访问项目列表
    if (role === 'PLATFORM_ADMIN') {
      throw new ForbiddenException({ code: 1003, message: '无权限访问' });
    }

    const { page = 1, pageSize = 10, name, status } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {
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

  /**
   * 创建项目
   */
  async create(createProjectDto: CreateProjectDto, tenantId: number | null, userId: number, role: string) {
    if (role === 'PLATFORM_ADMIN') {
      throw new ForbiddenException({ code: 1003, message: '无权限创建项目' });
    }

    // 生成 qr_code_token
    const qrCodeToken = uuidv4();

    const project = await this.prisma.project.create({
      data: {
        tenantId: tenantId!,
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

    // 生成项目二维码
    const { qrCodeUrl } = await this.fileService.generateProjectQrCode(Number(project.id), tenantId!);

    // 返回完整的项目信息
    return {
      ...project,
      qrCodeUrl,
    };
  }

  /**
   * 项目详情
   */
  async findById(id: number, tenantId: number | null, role: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException({ code: 1002, message: '项目不存在' });
    }

    // PLATFORM_ADMIN 可以查看所有项目
    if (role === 'PLATFORM_ADMIN') {
      return project;
    }

    // COMPANY_ADMIN 只能查看本企业的项目
    if (Number(project.tenantId) !== tenantId) {
      throw new ForbiddenException({ code: 1003, message: '无权限查看' });
    }

    return project;
  }

  /**
   * 编辑项目
   */
  async update(id: number, updateProjectDto: UpdateProjectDto, tenantId: number | null, role: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException({ code: 1002, message: '项目不存在' });
    }

    // PLATFORM_ADMIN 可以编辑所有项目
    if (role !== 'PLATFORM_ADMIN' && Number(project.tenantId) !== tenantId) {
      throw new ForbiddenException({ code: 1003, message: '无权限编辑' });
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

  /**
   * 项目启停
   */
  async changeStatus(id: number, dto: ChangeProjectStatusDto, tenantId: number | null, role: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException({ code: 1002, message: '项目不存在' });
    }

    // PLATFORM_ADMIN 可以操作所有项目
    if (role !== 'PLATFORM_ADMIN' && Number(project.tenantId) !== tenantId) {
      throw new ForbiddenException({ code: 1003, message: '无权限操作' });
    }

    return this.prisma.project.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  /**
   * 删除项目（软删除）
   */
  async remove(id: number, tenantId: number | null, role: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException({ code: 1002, message: '项目不存在' });
    }

    // PLATFORM_ADMIN 可以删除所有项目
    if (role !== 'PLATFORM_ADMIN' && Number(project.tenantId) !== tenantId) {
      throw new ForbiddenException({ code: 1003, message: '无权限删除' });
    }

    return this.prisma.project.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
