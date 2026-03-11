import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto, ChangeCompanyStatusDto, QueryCompanyDto } from './dto/company.dto';
import { CompanyStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  /**
   * 公司列表（分页，仅 PLATFORM_ADMIN）
   */
  async findAll(query: QueryCompanyDto, role: string) {
    if (role !== 'PLATFORM_ADMIN') {
      throw new ForbiddenException({ code: 1003, message: '无权限访问' });
    }

    const { page = 1, pageSize = 10, name, status } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (name) {
      where.name = { contains: name };
    }
    if (status) {
      where.status = status;
    }

    const [list, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 创建公司（仅 PLATFORM_ADMIN）
   * 同时自动创建对应账户和企业管理员用户
   */
  async create(createCompanyDto: CreateCompanyDto, userId: number, role: string) {
    if (role !== 'PLATFORM_ADMIN') {
      throw new ForbiddenException({ code: 1003, message: '无权限创建公司' });
    }

    // 创建公司
    const company = await this.prisma.company.create({
      data: {
        name: createCompanyDto.name,
        shortName: createCompanyDto.shortName,
        contactName: createCompanyDto.contactName,
        contactPhone: createCompanyDto.contactPhone,
        contactEmail: createCompanyDto.contactEmail,
        address: createCompanyDto.address,
        createdBy: userId,
      },
    });

    // 同时创建账户（balance = 0，status = ACTIVE）
    await this.prisma.account.create({
      data: {
        tenantId: company.id,
        balance: 0,
        status: 'ACTIVE',
      },
    });

    // 如果提供了管理员信息，则创建企业管理员用户
    if (
      createCompanyDto.adminUsername &&
      createCompanyDto.adminPassword &&
      createCompanyDto.adminRealName &&
      createCompanyDto.adminPhone
    ) {
      const hashedPassword = await bcrypt.hash(createCompanyDto.adminPassword, 10);
      await this.prisma.user.create({
        data: {
          tenantId: company.id,
          username: createCompanyDto.adminUsername,
          password: hashedPassword,
          realName: createCompanyDto.adminRealName,
          phone: createCompanyDto.adminPhone,
          role: 'COMPANY_ADMIN',
          status: 'ACTIVE',
        },
      });
    }

    return company;
  }

  /**
   * 公司详情
   */
  async findById(id: number, role: string, tenantId: number | null) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException({ code: 1002, message: '公司不存在' });
    }

    // COMPANY_ADMIN 只能查看本企业
    if (role === 'COMPANY_ADMIN' && tenantId !== id) {
      throw new ForbiddenException({ code: 1003, message: '无权限查看' });
    }

    return company;
  }

  /**
   * 编辑公司
   */
  async update(id: number, updateCompanyDto: UpdateCompanyDto, role: string, tenantId: number | null) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException({ code: 1002, message: '公司不存在' });
    }

    // PLATFORM_ADMIN 可以编辑所有公司
    if (role === 'PLATFORM_ADMIN') {
      return this.prisma.company.update({
        where: { id },
        data: {
          name: updateCompanyDto.name,
          shortName: updateCompanyDto.shortName,
          contactName: updateCompanyDto.contactName,
          contactPhone: updateCompanyDto.contactPhone,
          contactEmail: updateCompanyDto.contactEmail,
          address: updateCompanyDto.address,
        },
      });
    }

    // COMPANY_ADMIN 只能编辑本企业
    if (role === 'COMPANY_ADMIN' && tenantId !== id) {
      throw new ForbiddenException({ code: 1003, message: '无权限编辑' });
    }

    return this.prisma.company.update({
      where: { id },
      data: {
        name: updateCompanyDto.name,
        shortName: updateCompanyDto.shortName,
        contactName: updateCompanyDto.contactName,
        contactPhone: updateCompanyDto.contactPhone,
        contactEmail: updateCompanyDto.contactEmail,
        address: updateCompanyDto.address,
      },
    });
  }

  /**
   * 启停公司（仅 PLATFORM_ADMIN）
   */
  async changeStatus(id: number, dto: ChangeCompanyStatusDto, role: string) {
    if (role !== 'PLATFORM_ADMIN') {
      throw new ForbiddenException({ code: 1003, message: '无权限操作' });
    }

    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException({ code: 1002, message: '公司不存在' });
    }

    return this.prisma.company.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  /**
   * 查看公司内部数据
   */
  async getOverview(id: number, role: string, tenantId: number | null) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException({ code: 1002, message: '公司不存在' });
    }

    // COMPANY_ADMIN 只能查看本企业
    if (role === 'COMPANY_ADMIN' && tenantId !== id) {
      throw new ForbiddenException({ code: 1003, message: '无权限查看' });
    }

    // 并行查询项目数量、账户余额、最近充值流水
    const [projectCount, account, recentRecharges] = await Promise.all([
      this.prisma.project.count({ where: { tenantId: id } }),
      this.prisma.account.findUnique({ where: { tenantId: id } }),
      this.prisma.rechargeOrder.findMany({
        where: { tenantId: id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      companyId: id,
      companyName: company.name,
      projectCount,
      balance: account?.balance || 0,
      accountStatus: account?.status || 'ACTIVE',
      recentRecharges,
    };
  }
}
