import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto, ChangeCompanyStatusDto, QueryCompanyDto } from './dto/company.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('企业管理模块')
@ApiBearerAuth('JWT-auth')
@Controller('companies')
@UseGuards(AuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * 公司列表（分页，仅 PLATFORM_ADMIN）
   */
  @Get()
  @ApiOperation({ summary: '获取公司列表', description: '分页获取公司列表，仅平台管理员可访问' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: QueryCompanyDto, @CurrentUser() user: JwtPayload) {
    const result = await this.companyService.findAll(query, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 创建公司（仅 PLATFORM_ADMIN）
   */
  @Post()
  @ApiOperation({ summary: '创建公司', description: '创建新公司，仅平台管理员可操作' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createCompanyDto: CreateCompanyDto, @CurrentUser() user: JwtPayload) {
    const result = await this.companyService.create(createCompanyDto, user.userId, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 公司详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取公司详情', description: '获取指定公司的详细信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.companyService.findById(id, user.role, user.tenantId);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 编辑公司
   */
  @Patch(':id')
  @ApiOperation({ summary: '编辑公司', description: '更新公司信息' })
  @ApiResponse({ status: 200, description: '编辑成功' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.companyService.update(id, updateCompanyDto, user.role, user.tenantId);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 启停公司（仅 PLATFORM_ADMIN）
   */
  @Patch(':id/status')
  @ApiOperation({ summary: '启停公司', description: '启用或停用公司，仅平台管理员可操作' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeCompanyStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.companyService.changeStatus(id, dto, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 查看公司内部数据
   */
  @Get(':id/overview')
  @ApiOperation({ summary: '获取公司内部数据', description: '查看公司的项目数量、账户余额、充值流水等' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getOverview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.companyService.getOverview(id, user.role, user.tenantId);
    return { code: 0, message: 'success', data: result };
  }
}
