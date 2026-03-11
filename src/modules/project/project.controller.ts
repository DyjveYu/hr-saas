import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto, ChangeProjectStatusDto, QueryProjectDto } from './dto/project.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('项目管理模块')
@ApiBearerAuth('JWT-auth')
@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * 项目列表（分页，仅 COMPANY_ADMIN）
   */
  @Get()
  @ApiOperation({ summary: '获取项目列表', description: '分页获取项目列表，仅企业管理员可访问' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: QueryProjectDto, @CurrentUser() user: JwtPayload) {
    const result = await this.projectService.findAll(query, user.tenantId, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 创建项目
   */
  @Post()
  @ApiOperation({ summary: '创建项目', description: '创建新项目，仅企业管理员可操作' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createProjectDto: CreateProjectDto, @CurrentUser() user: JwtPayload) {
    const result = await this.projectService.create(createProjectDto, user.tenantId, user.userId, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 项目详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取项目详情', description: '获取指定项目的详细信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.projectService.findById(id, user.tenantId, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 编辑项目
   */
  @Patch(':id')
  @ApiOperation({ summary: '编辑项目', description: '更新项目信息' })
  @ApiResponse({ status: 200, description: '编辑成功' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.projectService.update(id, updateProjectDto, user.tenantId, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 项目启停
   */
  @Patch(':id/status')
  @ApiOperation({ summary: '项目启停', description: '启用或停用项目' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeProjectStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.projectService.changeStatus(id, dto, user.tenantId, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 删除项目（软删除）
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除项目', description: '软删除项目' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.projectService.remove(id, user.tenantId, user.role);
    return { code: 0, message: 'success', data: result };
  }
}
