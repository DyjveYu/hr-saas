import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRechargeOrderDto, QueryRechargeOrderDto } from './dto/recharge.dto';

function generateOrderNo(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `RC${yyyy}${mm}${dd}${random}`;
}

@Injectable()
export class RechargeService {
  private readonly logger = new Logger('RechargeModule');

  constructor(private prisma: PrismaService) {}

  /**
   * 创建充值申请
   */
  async create(dto: CreateRechargeOrderDto, tenantId: number, userId: number) {
    // 校验：同一企业已有 PENDING 状态的申请时，不允许重复提交
    const existingPending = await this.prisma.rechargeOrder.findFirst({
      where: {
        tenantId,
        status: 'PENDING',
      },
    });

    if (existingPending) {
      throw new BadRequestException({ code: 2006, message: '已有待处理的充值申请，请勿重复提交' });
    }

    // 生成唯一 order_no
    const orderNo = generateOrderNo();

    const rechargeOrder = await this.prisma.rechargeOrder.create({
      data: {
        tenantId,
        orderNo,
        amount: dto.amount,
        transferVoucherUrl: dto.transferVoucherUrl,
        remark: dto.remark,
        status: 'PENDING',
        createdBy: userId,
      },
    });

    // 记录充值申请日志
    this.logger.log(`充值申请创建 - userId: ${userId}, tenantId: ${tenantId}, orderNo: ${orderNo}, amount: ${dto.amount}`);

    return rechargeOrder;
  }

  /**
   * 平台管理员确认充值到账
   */
  async complete(id: number, role: string) {
    if (role !== 'PLATFORM_ADMIN') {
      throw new ForbiddenException({ code: 1003, message: '无权限操作' });
    }

    const rechargeOrder = await this.prisma.rechargeOrder.findUnique({
      where: { id },
    });

    if (!rechargeOrder) {
      throw new NotFoundException({ code: 1002, message: '充值订单不存在' });
    }

    if (rechargeOrder.status !== 'PENDING') {
      throw new BadRequestException({ code: 2007, message: '订单状态不是待处理' });
    }

    // 使用事务处理：更新订单状态、账户余额、写入流水
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. 更新充值订单状态为 COMPLETED
      await tx.rechargeOrder.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });

      // 2. 获取当前账户余额
      const account = await tx.account.findUnique({
        where: { tenantId: rechargeOrder.tenantId },
      });

      if (!account) {
        throw new NotFoundException({ code: 1002, message: '账户不存在' });
      }

      // 3. 更新账户余额
      const newBalance = account.balance.plus(rechargeOrder.amount);
      await tx.account.update({
        where: { tenantId: rechargeOrder.tenantId },
        data: { balance: newBalance },
      });

      // 4. 写入资金流水
      await tx.transactionRecord.create({
        data: {
          tenantId: rechargeOrder.tenantId,
          type: 'RECHARGE',
          amount: rechargeOrder.amount,
          direction: 'IN',
          beforeBalance: account.balance,
          afterBalance: newBalance,
          referenceId: rechargeOrder.id,
          referenceNo: rechargeOrder.orderNo,
          operatorId: undefined,
        },
      });

      return {
        rechargeOrder: await tx.rechargeOrder.findUnique({ where: { id } }),
        newBalance,
      };
    });

    // 记录充值确认到账日志
    this.logger.log(`充值确认到账 - orderNo: ${rechargeOrder.orderNo}, amount: ${rechargeOrder.amount}, newBalance: ${result.newBalance}`);

    return result.rechargeOrder;
  }

  /**
   * 充值记录列表
   */
  async findAll(query: QueryRechargeOrderDto, tenantId: number | null, role: string) {
    const { page = 1, pageSize = 10, tenantId: filterTenantId, status } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    // COMPANY_ADMIN 只能查看本企业记录
    if (role === 'COMPANY_ADMIN') {
      // 检查是否尝试访问其他企业记录
      if (filterTenantId && filterTenantId !== tenantId) {
        throw new ForbiddenException({ code: 1003, message: '无权限查看其他企业的充值记录' });
      }
      where.tenantId = tenantId;
    }
    // PLATFORM_ADMIN 可查所有，支持按 tenant_id 筛选
    else if (role === 'PLATFORM_ADMIN' && filterTenantId) {
      where.tenantId = filterTenantId;
    }

    // 按状态筛选
    if (status) {
      where.status = status;
    }

    const [list, total] = await Promise.all([
      this.prisma.rechargeOrder.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.rechargeOrder.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
    };
  }
}
