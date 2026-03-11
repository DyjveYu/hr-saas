import { Controller, Get, Patch, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('账户模块')
@ApiBearerAuth('JWT-auth')
@Controller('account')
@UseGuards(AuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /**
   * 账户余额查询
   */
  @Get('balance')
  @ApiOperation({ summary: '查询账户余额', description: '企业管理员查询本企业账户余额' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getBalance(@CurrentUser() user: JwtPayload) {
    // COMPANY_ADMIN 查询本企业，PLATFORM_ADMIN 可指定 tenantId
    const tenantId = user.role === 'PLATFORM_ADMIN' && user.tenantId === null
      ? undefined
      : user.tenantId;
    const result = await this.accountService.getBalance(tenantId!);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 账户状态管理
   */
  @Patch('status')
  @ApiOperation({ summary: '修改账户状态', description: '平台管理员冻结/解冻账户' })
  @ApiResponse({ status: 200, description: '修改成功' })
  async changeStatus(
    @Body() dto: { status: string; tenantId?: number },
    @CurrentUser() user: JwtPayload,
  ) {
    // PLATFORM_ADMIN 可指定 tenantId，COMPANY_ADMIN 操作本企业
    const targetTenantId = user.role === 'PLATFORM_ADMIN' && dto.tenantId
      ? dto.tenantId
      : user.tenantId!;
    const result = await this.accountService.changeStatus(targetTenantId, dto.status, user.role);
    return { code: 0, message: 'success', data: result };
  }
}
