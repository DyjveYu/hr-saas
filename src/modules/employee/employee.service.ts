import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto, ChangeEmployeeStatusDto, AssignProjectDto, QueryEmployeeDto } from './dto/employee.dto';
import { EmployeeStatus } from '@prisma/client';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  /**
   * 员工列表（分页，支持按姓名/项目/状态筛选）
   */
  async findAll(query: QueryEmployeeDto, tenantId: number | null) {
    const { page = 1, pageSize = 10, name, projectId, status } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {
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

  /**
   * 创建员工
   */
  async create(createEmployeeDto: CreateEmployeeDto, tenantId: number, userId: number) {
    // 同一企业内 id_card 唯一校验
    const existing = await this.prisma.employee.findFirst({
      where: {
        tenantId,
        idCard: createEmployeeDto.idCard,
      },
    });

    if (existing) {
      throw new BadRequestException({ code: 2003, message: '该身份证号码已在当前企业存在' });
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

  /**
   * 员工详情
   */
  async findById(id: number, tenantId: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException({ code: 1002, message: '员工不存在' });
    }

    if (Number(employee.tenantId) !== tenantId) {
      throw new ForbiddenException({ code: 1003, message: '无权限查看' });
    }

    return employee;
  }

  /**
   * 编辑员工
   */
  async update(id: number, updateEmployeeDto: UpdateEmployeeDto, tenantId: number) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new NotFoundException({ code: 1002, message: '员工不存在' });
    }

    if (Number(employee.tenantId) !== tenantId) {
      throw new ForbiddenException({ code: 1003, message: '无权限编辑' });
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

  /**
   * 删除员工（软删除，status = DISMISSED）
   */
  async remove(id: number, tenantId: number) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new NotFoundException({ code: 1002, message: '员工不存在' });
    }

    if (Number(employee.tenantId) !== tenantId) {
      throw new ForbiddenException({ code: 1003, message: '无权限删除' });
    }

    return this.prisma.employee.update({
      where: { id },
      data: { status: 'DISMISSED' },
    });
  }

  /**
   * 变更员工状态
   */
  async changeStatus(id: number, dto: ChangeEmployeeStatusDto, tenantId: number) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new NotFoundException({ code: 1002, message: '员工不存在' });
    }

    if (Number(employee.tenantId) !== tenantId) {
      throw new ForbiddenException({ code: 1003, message: '无权限操作' });
    }

    // 检查状态流转规则
    const isValid = this.checkStatusTransition(employee.status, dto.status);
    if (!isValid) {
      throw new BadRequestException({ code: 2004, message: '不符合状态流转规则' });
    }

    return this.prisma.employee.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  /**
   * 分配项目
   */
  async assignProject(id: number, dto: AssignProjectDto, tenantId: number) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new NotFoundException({ code: 1002, message: '员工不存在' });
    }

    if (Number(employee.tenantId) !== tenantId) {
      throw new ForbiddenException({ code: 1003, message: '无权限操作' });
    }

    // 检查项目是否存在且属于当前企业
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) {
      throw new NotFoundException({ code: 1002, message: '项目不存在' });
    }

    if (Number(project.tenantId) !== tenantId) {
      throw new ForbiddenException({ code: 1003, message: '项目不属于当前企业' });
    }

    // 更新员工项目并设置为 ACTIVE
    return this.prisma.employee.update({
      where: { id },
      data: {
        projectId: dto.projectId,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * 检查状态流转是否合法
   */
  private checkStatusTransition(current: EmployeeStatus, next: EmployeeStatus): boolean {
    const transitions: Record<EmployeeStatus, EmployeeStatus[]> = {
      PENDING: ['ACTIVE'],
      ACTIVE: ['PENDING_EXIT', 'FIRED', 'DISMISSED'],
      PENDING_EXIT: ['RESIGNED', 'FIRED'],
      RESIGNED: [],
      FIRED: [],
      DISMISSED: [],
    };

    return transitions[current]?.includes(next) ?? false;
  }
}
