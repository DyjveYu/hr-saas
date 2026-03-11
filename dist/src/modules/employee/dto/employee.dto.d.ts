import { EmployeeStatus } from '@prisma/client';
export declare class CreateEmployeeDto {
    name: string;
    idCard: string;
    phone: string;
    projectId?: number;
    emergencyContact?: string;
    emergencyPhone?: string;
    remark?: string;
}
export declare class UpdateEmployeeDto {
    name?: string;
    phone?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    remark?: string;
}
export declare class ChangeEmployeeStatusDto {
    status: EmployeeStatus;
}
export declare class AssignProjectDto {
    projectId: number;
}
export declare class QueryEmployeeDto {
    name?: string;
    projectId?: number;
    status?: EmployeeStatus;
    page?: number;
    pageSize?: number;
}
