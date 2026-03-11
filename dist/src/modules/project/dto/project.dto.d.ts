import { ProjectStatus } from '@prisma/client';
export declare class CreateProjectDto {
    name: string;
    capacity?: number;
    siteManager?: string;
    siteManagerPhone?: string;
    financeManager?: string;
    financeManagerPhone?: string;
}
export declare class UpdateProjectDto {
    name?: string;
    capacity?: number;
    siteManager?: string;
    siteManagerPhone?: string;
    financeManager?: string;
    financeManagerPhone?: string;
}
export declare class ChangeProjectStatusDto {
    status: ProjectStatus;
}
export declare class QueryProjectDto {
    name?: string;
    status?: ProjectStatus;
    page?: number;
    pageSize?: number;
}
