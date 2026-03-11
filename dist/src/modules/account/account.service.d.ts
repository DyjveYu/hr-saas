import { PrismaService } from '../../common/prisma/prisma.service';
export declare class AccountService {
    private prisma;
    constructor(prisma: PrismaService);
    getBalance(tenantId: number): Promise<{
        balance: string;
        status: import("@prisma/client").$Enums.AccountStatus;
    }>;
    changeStatus(tenantId: number, status: string, role: string): Promise<{
        id: bigint;
        tenantId: bigint;
        status: import("@prisma/client").$Enums.AccountStatus;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
}
