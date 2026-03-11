import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto, ChangeCompanyStatusDto, QueryCompanyDto } from './dto/company.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
    findAll(query: QueryCompanyDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
    create(createCompanyDto: CreateCompanyDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
    findById(id: number, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
    update(id: number, updateCompanyDto: UpdateCompanyDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
    changeStatus(id: number, dto: ChangeCompanyStatusDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
    getOverview(id: number, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
}
