import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto, ChangeEmployeeStatusDto, AssignProjectDto, QueryEmployeeDto } from './dto/employee.dto';
export declare class EmployeeService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryEmployeeDto, tenantId: number | null): Promise<{
        list: ({
            project: {
                id: bigint;
                name: string;
            } | null;
        } & {
            id: bigint;
            tenantId: bigint;
            phone: string;
            status: import("@prisma/client").$Enums.EmployeeStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            createdBy: bigint | null;
            projectId: bigint | null;
            idCard: string;
            emergencyContact: string | null;
            emergencyPhone: string | null;
            idCardFrontUrl: string | null;
            idCardBackUrl: string | null;
            openid: string | null;
            remark: string | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    create(createEmployeeDto: CreateEmployeeDto, tenantId: number, userId: number): Promise<{
        id: bigint;
        tenantId: bigint;
        phone: string;
        status: import("@prisma/client").$Enums.EmployeeStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        createdBy: bigint | null;
        projectId: bigint | null;
        idCard: string;
        emergencyContact: string | null;
        emergencyPhone: string | null;
        idCardFrontUrl: string | null;
        idCardBackUrl: string | null;
        openid: string | null;
        remark: string | null;
    }>;
    findById(id: number, tenantId: number): Promise<{
        project: {
            id: bigint;
            name: string;
        } | null;
    } & {
        id: bigint;
        tenantId: bigint;
        phone: string;
        status: import("@prisma/client").$Enums.EmployeeStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        createdBy: bigint | null;
        projectId: bigint | null;
        idCard: string;
        emergencyContact: string | null;
        emergencyPhone: string | null;
        idCardFrontUrl: string | null;
        idCardBackUrl: string | null;
        openid: string | null;
        remark: string | null;
    }>;
    update(id: number, updateEmployeeDto: UpdateEmployeeDto, tenantId: number): Promise<{
        id: bigint;
        tenantId: bigint;
        phone: string;
        status: import("@prisma/client").$Enums.EmployeeStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        createdBy: bigint | null;
        projectId: bigint | null;
        idCard: string;
        emergencyContact: string | null;
        emergencyPhone: string | null;
        idCardFrontUrl: string | null;
        idCardBackUrl: string | null;
        openid: string | null;
        remark: string | null;
    }>;
    remove(id: number, tenantId: number): Promise<{
        id: bigint;
        tenantId: bigint;
        phone: string;
        status: import("@prisma/client").$Enums.EmployeeStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        createdBy: bigint | null;
        projectId: bigint | null;
        idCard: string;
        emergencyContact: string | null;
        emergencyPhone: string | null;
        idCardFrontUrl: string | null;
        idCardBackUrl: string | null;
        openid: string | null;
        remark: string | null;
    }>;
    changeStatus(id: number, dto: ChangeEmployeeStatusDto, tenantId: number): Promise<{
        id: bigint;
        tenantId: bigint;
        phone: string;
        status: import("@prisma/client").$Enums.EmployeeStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        createdBy: bigint | null;
        projectId: bigint | null;
        idCard: string;
        emergencyContact: string | null;
        emergencyPhone: string | null;
        idCardFrontUrl: string | null;
        idCardBackUrl: string | null;
        openid: string | null;
        remark: string | null;
    }>;
    assignProject(id: number, dto: AssignProjectDto, tenantId: number): Promise<{
        id: bigint;
        tenantId: bigint;
        phone: string;
        status: import("@prisma/client").$Enums.EmployeeStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        createdBy: bigint | null;
        projectId: bigint | null;
        idCard: string;
        emergencyContact: string | null;
        emergencyPhone: string | null;
        idCardFrontUrl: string | null;
        idCardBackUrl: string | null;
        openid: string | null;
        remark: string | null;
    }>;
    private checkStatusTransition;
}
