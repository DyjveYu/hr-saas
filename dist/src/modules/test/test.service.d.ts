import { PrismaService } from '../../common/prisma/prisma.service';
export declare class TestService {
    private prisma;
    constructor(prisma: PrismaService);
    createProject(tenantId: number, name: string): Promise<{
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
    }>;
    findProjects(tenantId: number): Promise<{
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
    }[]>;
    findProject(tenantId: number, projectId: number): Promise<{
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
    } | null>;
    findCompanies(): Promise<{
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
    }[]>;
}
