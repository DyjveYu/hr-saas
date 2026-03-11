import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { TestService } from './test.service';
export declare class TestController {
    private testService;
    constructor(testService: TestService);
    getCompanies(): Promise<{
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
        }[];
    }>;
    getProjects(user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
            id: bigint;
            tenantId: bigint;
            status: import("@prisma/client").$Enums.ProjectStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            createdBy: bigint | null;
            capacity: number | null;
            siteManager: string | null;
            siteManagerPhone: string | null;
            financeManager: string | null;
            financeManagerPhone: string | null;
            qrCodeUrl: string | null;
            qrCodeToken: string | null;
        }[];
    }>;
    createProject(user: JwtPayload, body: {
        name: string;
    }): Promise<{
        code: number;
        message: string;
        data: {
            id: bigint;
            tenantId: bigint;
            status: import("@prisma/client").$Enums.ProjectStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            createdBy: bigint | null;
            capacity: number | null;
            siteManager: string | null;
            siteManagerPhone: string | null;
            financeManager: string | null;
            financeManagerPhone: string | null;
            qrCodeUrl: string | null;
            qrCodeToken: string | null;
        };
    }>;
    getProject(user: JwtPayload, id: string): Promise<{
        code: number;
        message: string;
        data: null;
    } | {
        code: number;
        message: string;
        data: {
            id: bigint;
            tenantId: bigint;
            status: import("@prisma/client").$Enums.ProjectStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            createdBy: bigint | null;
            capacity: number | null;
            siteManager: string | null;
            siteManagerPhone: string | null;
            financeManager: string | null;
            financeManagerPhone: string | null;
            qrCodeUrl: string | null;
            qrCodeToken: string | null;
        };
    }>;
    getPublic(): {
        code: number;
        message: string;
        data: {
            message: string;
        };
    };
}
