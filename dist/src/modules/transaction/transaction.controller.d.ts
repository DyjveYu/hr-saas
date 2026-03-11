import { TransactionService } from './transaction.service';
import { QueryTransactionDto } from './dto/transaction.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class TransactionController {
    private readonly transactionService;
    constructor(transactionService: TransactionService);
    findAll(query: QueryTransactionDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
    findById(id: number, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
}
