import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto, ChangeEmployeeStatusDto, AssignProjectDto, QueryEmployeeDto } from './dto/employee.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('员工管理模块')
@ApiBearerAuth('JWT-auth')
@Controller('employees')
@UseGuards(AuthGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  /**
   * 员工列表（分页，支持按姓名/项目/状态筛选）
   */
  @Get()
  @ApiOperation({ summary: '获取员工列表', description: '分页获取员工列表，支持按姓名/项目/状态筛选' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: QueryEmployeeDto, @CurrentUser() user: JwtPayload) {
    const result = await this.employeeService.findAll(query, user.tenantId);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 创建员工
   */
  @Post()
  @ApiOperation({ summary: '创建员工', description: '创建新员工' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto, @CurrentUser() user: JwtPayload) {
    const result = await this.employeeService.create(createEmployeeDto, user.tenantId!, user.userId);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 员工详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取员工详情', description: '获取指定员工的详细信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.employeeService.findById(id, user.tenantId!);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 编辑员工
   */
  @Patch(':id')
  @ApiOperation({ summary: '编辑员工', description: '更新员工信息' })
  @ApiResponse({ status: 200, description: '编辑成功' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.employeeService.update(id, updateEmployeeDto, user.tenantId!);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 删除员工（软删除）
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除员工', description: '软删除员工（状态改为DISMISSED）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.employeeService.remove(id, user.tenantId!);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 变更员工状态
   */
  @Patch(':id/status')
  @ApiOperation({ summary: '变更员工状态', description: '变更员工在职状态（PENDING->ACTIVE->PENDING_EXIT->RESIGNED等）' })
  @ApiResponse({ status: 200, description: '变更成功' })
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeEmployeeStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.employeeService.changeStatus(id, dto, user.tenantId!);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 分配项目
   */
  @Patch(':id/project')
  @ApiOperation({ summary: '分配项目', description: '为员工分配所属项目' })
  @ApiResponse({ status: 200, description: '分配成功' })
  async assignProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignProjectDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.employeeService.assignProject(id, dto, user.tenantId!);
    return { code: 0, message: 'success', data: result };
  }
}
