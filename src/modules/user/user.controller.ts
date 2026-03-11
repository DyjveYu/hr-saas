import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto, SetPaymentPasswordDto, ChangeStatusDto } from './dto/user.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('用户账号模块')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 账号列表
   * PLATFORM_ADMIN 查所有，COMPANY_ADMIN 查本企业
   */
  @Get()
  @ApiOperation({ summary: '获取账号列表', description: 'PLATFORM_ADMIN查看所有账号，COMPANY_ADMIN查看本企业账号' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@CurrentUser() user: JwtPayload) {
    const users = await this.userService.findAll(user.tenantId, user.role);
    return { code: 0, message: 'success', data: users };
  }

  /**
   * 创建账号
   */
  @Post()
  @ApiOperation({ summary: '创建账号', description: '创建新的用户账号' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: JwtPayload) {
    const result = await this.userService.create(createUserDto, user.tenantId, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 修改账号
   */
  @Patch(':id')
  @ApiOperation({ summary: '修改账号', description: '更新用户账号信息' })
  @ApiResponse({ status: 200, description: '修改成功' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.userService.update(id, updateUserDto, user.tenantId, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 删除账号（软删除）
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除账号', description: '软删除账号（禁用账号）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.userService.remove(id, user.tenantId, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 修改登录密码
   */
  @Patch(':id/password')
  @ApiOperation({ summary: '修改登录密码', description: '修改用户登录密码' })
  @ApiResponse({ status: 200, description: '修改成功' })
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.userService.changePassword(id, dto, user.tenantId, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 设置/修改支付密码
   */
  @Patch(':id/payment-password')
  @ApiOperation({ summary: '设置支付密码', description: '设置或修改支付密码' })
  @ApiResponse({ status: 200, description: '设置成功' })
  async setPaymentPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetPaymentPasswordDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.userService.setPaymentPassword(id, dto, user.tenantId, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 账号启停
   */
  @Patch(':id/status')
  @ApiOperation({ summary: '账号启停', description: '启用或禁用账号' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.userService.changeStatus(id, dto, user.tenantId, user.role);
    return { code: 0, message: 'success', data: result };
  }
}
