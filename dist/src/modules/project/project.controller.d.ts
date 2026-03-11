import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto, ChangeProjectStatusDto, QueryProjectDto } from './dto/project.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class ProjectController {
    private readonly projectService;
    constructor(projectService: ProjectService);
    findAll(query: QueryProjectDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
            list: {
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
            total: number;
            page: number;
            pageSize: number;
        };
    }>;
    create(createProjectDto: CreateProjectDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
            qrCodeUrl: string;
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
            qrCodeToken: string | null;
        };
    }>;
    findById(id: number, user: JwtPayload): Promise<{
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
    update(id: number, updateProjectDto: UpdateProjectDto, user: JwtPayload): Promise<{
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
    changeStatus(id: number, dto: ChangeProjectStatusDto, user: JwtPayload): Promise<{
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
    remove(id: number, user: JwtPayload): Promise<{
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
}
