import { TransactionType, TransactionDirection } from '@prisma/client';
export declare class QueryTransactionDto {
    type?: TransactionType;
    direction?: TransactionDirection;
    startDate?: string;
    endDate?: string;
    tenantId?: number;
    page?: number;
    pageSize?: number;
}
