import { CompanyStatus } from '@prisma/client';
export declare class CreateCompanyDto {
    name: string;
    shortName?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    address?: string;
    adminUsername?: string;
    adminPassword?: string;
    adminRealName?: string;
    adminPhone?: string;
}
export declare class UpdateCompanyDto {
    name?: string;
    shortName?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    address?: string;
}
export declare class ChangeCompanyStatusDto {
    status: CompanyStatus;
}
export declare class QueryCompanyDto {
    name?: string;
    status?: CompanyStatus;
    page?: number;
    pageSize?: number;
}
