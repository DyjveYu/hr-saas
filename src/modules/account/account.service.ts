import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  /**
   * 账户余额查询
   */
  async getBalance(tenantId: number) {
    const account = await this.prisma.account.findUnique({
      where: { tenantId },
    });

    if (!account) {
      throw new NotFoundException({ code: 1002, message: '账户不存在' });
    }

    return {
      balance: account.balance.toString(),
      status: account.status,
    };
  }

  /**
   * 账户状态管理（PLATFORM_ADMIN 可冻结/解冻）
   */
  async changeStatus(tenantId: number, status: string, role: string) {
    if (role !== 'PLATFORM_ADMIN') {
      throw new ForbiddenException({ code: 1003, message: '无权限操作' });
    }

    const account = await this.prisma.account.findUnique({
      where: { tenantId },
    });

    if (!account) {
      throw new NotFoundException({ code: 1002, message: '账户不存在' });
    }

    return this.prisma.account.update({
      where: { tenantId },
      data: { status: status as any },
    });
  }
}
