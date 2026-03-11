import { PrismaService } from '../../common/prisma/prisma.service';
import { QueryTransactionDto } from './dto/transaction.dto';
export declare class TransactionService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryTransactionDto, tenantId: number | null, role: string): Promise<{
        list: {
            id: bigint;
            tenantId: bigint;
            createdAt: Date;
            remark: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import("@prisma/client").$Enums.TransactionType;
            direction: import("@prisma/client").$Enums.TransactionDirection;
            beforeBalance: import("@prisma/client/runtime/library").Decimal;
            afterBalance: import("@prisma/client/runtime/library").Decimal;
            referenceNo: string | null;
            operatorId: bigint | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findById(id: number, tenantId: number | null, role: string): Promise<{
        id: bigint;
        tenantId: bigint;
        createdAt: Date;
        remark: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        type: import("@prisma/client").$Enums.TransactionType;
        direction: import("@prisma/client").$Enums.TransactionDirection;
        beforeBalance: import("@prisma/client/runtime/library").Decimal;
        afterBalance: import("@prisma/client/runtime/library").Decimal;
        referenceId: bigint | null;
        referenceNo: string | null;
        operatorId: bigint | null;
    }>;
}
