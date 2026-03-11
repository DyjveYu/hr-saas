import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { QueryTransactionDto } from './dto/transaction.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('资金流水模块')
@ApiBearerAuth('JWT-auth')
@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * 资金流水列表
   */
  @Get()
  @ApiOperation({ summary: '获取资金流水列表', description: '分页获取资金流水列表，支持按类型/方向/时间筛选' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: QueryTransactionDto, @CurrentUser() user: JwtPayload) {
    const result = await this.transactionService.findAll(query, user.tenantId, user.role);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 流水详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取流水详情', description: '获取指定资金流水的详细信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.transactionService.findById(id, user.tenantId, user.role);
    return { code: 0, message: 'success', data: result };
  }
}
