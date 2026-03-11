import { RechargeService } from './recharge.service';
import { CreateRechargeOrderDto, QueryRechargeOrderDto } from './dto/recharge.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class RechargeController {
    private readonly rechargeService;
    constructor(rechargeService: RechargeService);
    create(dto: CreateRechargeOrderDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
    complete(id: number, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        } | null;
    }>;
    findAll(query: QueryRechargeOrderDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
}
