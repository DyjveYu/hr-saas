import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto, ChangeCompanyStatusDto, QueryCompanyDto } from './dto/company.dto';
export declare class CompanyService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryCompanyDto, role: string): Promise<{
        list: {
            id: bigint;
            status: import("@prisma/client").$Enums.CompanyStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            shortName: string | null;
            contactName: string | null;
            contactPhone: string | null;
            contactEmail: string | null;
            address: string | null;
            createdBy: bigint | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    create(createCompanyDto: CreateCompanyDto, userId: number, role: string): Promise<{
        id: bigint;
        status: import("@prisma/client").$Enums.CompanyStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shortName: string | null;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        address: string | null;
        createdBy: bigint | null;
    }>;
    findById(id: number, role: string, tenantId: number | null): Promise<{
        id: bigint;
        status: import("@prisma/client").$Enums.CompanyStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shortName: string | null;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        address: string | null;
        createdBy: bigint | null;
    }>;
    update(id: number, updateCompanyDto: UpdateCompanyDto, role: string, tenantId: number | null): Promise<{
        id: bigint;
        status: import("@prisma/client").$Enums.CompanyStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shortName: string | null;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        address: string | null;
        createdBy: bigint | null;
    }>;
    changeStatus(id: number, dto: ChangeCompanyStatusDto, role: string): Promise<{
        id: bigint;
        status: import("@prisma/client").$Enums.CompanyStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shortName: string | null;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        address: string | null;
        createdBy: bigint | null;
    }>;
    getOverview(id: number, role: string, tenantId: number | null): Promise<{
        companyId: number;
        companyName: string;
        projectCount: number;
        balance: number | import("@prisma/client/runtime/library").Decimal;
        accountStatus: import("@prisma/client").$Enums.AccountStatus;
        recentRecharges: {
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
        }[];
    }>;
}
