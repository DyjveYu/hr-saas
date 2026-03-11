import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private testService: TestService) {}

  /**
   * 公司管理接口（仅平台管理员可访问）
   * 用于验证权限模块
   */
  @Get('companies')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  async getCompanies() {
    const companies = await this.testService.findCompanies();
    return {
      code: 0,
      message: 'success',
      data: companies,
    };
  }

  /**
   * 项目管理接口（仅企业管理员可访问）
   * 用于验证多租户隔离
   */
  @Get('projects')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('COMPANY_ADMIN')
  async getProjects(@CurrentUser() user: JwtPayload) {
    const projects = await this.testService.findProjects(user.tenantId!);
    return {
      code: 0,
      message: 'success',
      data: projects,
    };
  }

  /**
   * 创建项目（带多租户隔离）
   */
  @Post('projects')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('COMPANY_ADMIN')
  async createProject(@CurrentUser() user: JwtPayload, @Body() body: { name: string }) {
    const project = await this.testService.createProject(user.tenantId!, body.name);
    return {
      code: 0,
      message: 'success',
      data: project,
    };
  }

  /**
   * 获取项目详情（验证跨租户访问）
   */
  @Get('projects/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('COMPANY_ADMIN')
  async getProject(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const projectId = parseInt(id, 10);
    const project = await this.testService.findProject(user.tenantId!, projectId);
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

  /**
   * 公开接口（无需认证）
   */
  @Get('public')
  getPublic() {
    return {
      code: 0,
      message: 'success',
      data: { message: '公开接口' },
    };
  }
}
