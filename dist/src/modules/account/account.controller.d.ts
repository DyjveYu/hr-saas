import { AccountService } from './account.service';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class AccountController {
    private readonly accountService;
    constructor(accountService: AccountService);
    getBalance(user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
            balance: string;
            status: import("@prisma/client").$Enums.AccountStatus;
        };
    }>;
    changeStatus(dto: {
        status: string;
        tenantId?: number;
    }, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
            id: bigint;
            tenantId: bigint;
            status: import("@prisma/client").$Enums.AccountStatus;
            createdAt: Date;
            updatedAt: Date;
            balance: import("@prisma/client/runtime/library").Decimal;
        };
    }>;
}
