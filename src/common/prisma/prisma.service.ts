import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * 返回带租户约束的 Prisma 扩展实例
   * 对 findMany、findFirst、create、update、delete 自动附加 tenant_id 条件
   * @param tenantId 租户ID（platform admin 传 null 或不调用此方法）
   */
  forTenant(tenantId: number | null) {
    // platform admin (tenantId 为 null) 不需要过滤
    if (tenantId === null || tenantId === undefined) {
      return this;
    }

    return this.$extends({
      query: {
        $allModels: {
          async findMany({ args, query }) {
            // company 表不含 tenant_id 字段，不过滤
            const model = args?.where ? (args as any)._prisma_model : null;
            if (model === 'Company') {
              return query(args);
            }
            args.where = { ...args.where, tenantId };
            return query(args);
          },
          async findFirst({ args, query }) {
            const model = args?.where ? (args as any)._prisma_model : null;
            if (model === 'Company') {
              return query(args);
            }
            args.where = { ...args.where, tenantId };
            return query(args);
          },
          async findUnique({ args, query }) {
            const model = args?.where ? (args as any)._prisma_model : null;
            if (model === 'Company') {
              return query(args);
            }
            args.where = { ...args.where, tenantId };
            return query(args);
          },
          async findUniqueOrThrow({ args, query }) {
            const model = args?.where ? (args as any)._prisma_model : null;
            if (model === 'Company') {
              return query(args);
            }
            args.where = { ...args.where, tenantId };
            return query(args);
          },
          async create({ args, query }) {
            const model = args?.data ? (args as any)._prisma_model : null;
            if (model === 'Company') {
              return query(args);
            }
            args.data = { ...args.data, tenantId: tenantId as any };
            return query(args);
          },
          async update({ args, query }) {
            const model = args?.where ? (args as any)._prisma_model : null;
            if (model === 'Company') {
              return query(args);
            }
            args.where = { ...args.where, tenantId };
            return query(args);
          },
          async delete({ args, query }) {
            const model = args?.where ? (args as any)._prisma_model : null;
            if (model === 'Company') {
              return query(args);
            }
            args.where = { ...args.where, tenantId };
            return query(args);
          },
        },
      },
    });
  }
}
