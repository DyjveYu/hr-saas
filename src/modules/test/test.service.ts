import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TestService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建项目（带多租户隔离）
   */
  async createProject(tenantId: number, name: string) {
    return this.prisma.project.create({
      data: {
        tenantId,
        name,
        capacity: 100,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * 查询项目列表（带多租户隔离）
   * 使用显式 tenantId 过滤
   */
  async findProjects(tenantId: number) {
    return this.prisma.project.findMany({
      where: { tenantId },
    });
  }

  /**
   * 查询单个项目（带多租户隔离）
   * 使用显式 tenantId 过滤
   */
  async findProject(tenantId: number, projectId: number) {
    return this.prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });
  }

  /**
   * 查询所有公司（platform admin 专用，不过滤 tenant_id）
   */
  async findCompanies() {
    return this.prisma.company.findMany();
  }
}
