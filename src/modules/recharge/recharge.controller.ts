import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RechargeService } from './recharge.service';
import { CreateRechargeOrderDto, QueryRechargeOrderDto } from './dto/recharge.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('充值模块')
@ApiBearerAuth('JWT-auth')
@Controller('recharge-orders')
@UseGuards(AuthGuard)
export class RechargeController {
  constructor(private readonly rechargeService: RechargeService) {}

  /**
   * 创建充值申请
   */
  @Post()
  @ApiOperation({ summary: '创建充值申请', description: '企业管理员提交充值申请' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() dto: CreateRechargeOrderDto, @CurrentUser() user: JwtPayload) {
    const result = await this.rechargeService.create(dto, user.tenantId!, user.userId);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 平台管理员确认充值到账
   */
  @Patch(':id/complete')
  @ApiOperation({ summary: '确认充值到账', description: '平台管理员确认充值到账，更新账户余额' })
  @ApiResponse({ status: 200, description: '确认成功' })
  async complete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.rechargeService.complete(id, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 充值记录列表
   */
  @Get()
  @ApiOperation({ summary: '获取充值记录列表', description: '分页获取充值记录列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: QueryRechargeOrderDto, @CurrentUser() user: JwtPayload) {
    const result = await this.rechargeService.findAll(query, user.tenantId, user.role);
    return { code: 0, message: 'success', data: result };
  }
}
