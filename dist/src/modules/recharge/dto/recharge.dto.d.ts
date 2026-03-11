import { RechargeStatus } from '@prisma/client';
export declare class CreateRechargeOrderDto {
    amount: number;
    transferVoucherUrl?: string;
    remark?: string;
}
export declare class QueryRechargeOrderDto {
    status?: RechargeStatus;
    tenantId?: number;
    page?: number;
    pageSize?: number;
}
