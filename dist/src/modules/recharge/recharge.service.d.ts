import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRechargeOrderDto, QueryRechargeOrderDto } from './dto/recharge.dto';
export declare class RechargeService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateRechargeOrderDto, tenantId: number, userId: number): Promise<{
        id: bigint;
        tenantId: bigint;
        status: import("@prisma/client").$Enums.RechargeStatus;
        createdAt: Date;
        updatedAt: Date;
        createdBy: bigint | null;
        remark: string | null;
        orderNo: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transferVoucherUrl: string | null;
    }>;
    complete(id: number, role: string): Promise<{
        id: bigint;
        tenantId: bigint;
        status: import("@prisma/client").$Enums.RechargeStatus;
        createdAt: Date;
        updatedAt: Date;
        createdBy: bigint | null;
        remark: string | null;
        orderNo: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transferVoucherUrl: string | null;
    } | null>;
    findAll(query: QueryRechargeOrderDto, tenantId: number | null, role: string): Promise<{
        list: ({
            company: {
                id: bigint;
                name: string;
            };
        } & {
            id: bigint;
            tenantId: bigint;
            status: import("@prisma/client").$Enums.RechargeStatus;
            createdAt: Date;
            updatedAt: Date;
            createdBy: bigint | null;
            remark: string | null;
            orderNo: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            transferVoucherUrl: string | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
}
