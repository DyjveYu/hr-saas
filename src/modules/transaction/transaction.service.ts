import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueryTransactionDto } from './dto/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  /**
   * 资金流水列表
   */
  async findAll(query: QueryTransactionDto, tenantId: number | null, role: string) {
    const { page = 1, pageSize = 10, type, direction, startDate, endDate, tenantId: filterTenantId } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    // COMPANY_ADMIN 只能查看本企业记录
    if (role === 'COMPANY_ADMIN') {
      // 检查是否尝试访问其他企业记录
      if (filterTenantId && filterTenantId !== tenantId) {
        throw new ForbiddenException({ code: 1003, message: '无权限查看其他企业的流水' });
      }
      where.tenantId = tenantId;
    }
    // PLATFORM_ADMIN 可查所有，支持按 tenant_id 筛选
    else if (role === 'PLATFORM_ADMIN' && filterTenantId) {
      where.tenantId = filterTenantId;
    }

    // 类型筛选
    if (type) {
      where.type = type;
    }

    // 方向筛选
    if (direction) {
      where.direction = direction;
    }

    // 时间范围筛选
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [list, total] = await Promise.all([
      this.prisma.transactionRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          tenantId: true,
          type: true,
          amount: true,
          direction: true,
          beforeBalance: true,
          afterBalance: true,
          referenceNo: true,
          operatorId: true,
          remark: true,
          createdAt: true,
        },
      }),
      this.prisma.transactionRecord.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 流水详情
   */
  async findById(id: number, tenantId: number | null, role: string) {
    const transaction = await this.prisma.transactionRecord.findUnique({
      where: { id },
      select: {
        id: true,
        tenantId: true,
        type: true,
        amount: true,
        direction: true,
        beforeBalance: true,
        afterBalance: true,
        referenceId: true,
        referenceNo: true,
        operatorId: true,
        remark: true,
        createdAt: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException({ code: 1002, message: '流水记录不存在' });
    }

    // COMPANY_ADMIN 只能查看本企业记录
    if (role === 'COMPANY_ADMIN' && Number(transaction.tenantId) !== tenantId) {
      throw new ForbiddenException({ code: 1003, message: '无权限查看' });
    }

    return transaction;
  }
}
