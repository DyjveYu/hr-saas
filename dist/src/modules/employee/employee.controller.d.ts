import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto, ChangeEmployeeStatusDto, AssignProjectDto, QueryEmployeeDto } from './dto/employee.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class EmployeeController {
    private readonly employeeService;
    constructor(employeeService: EmployeeService);
    findAll(query: QueryEmployeeDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
    create(createEmployeeDto: CreateEmployeeDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
    findById(id: number, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
    update(id: number, updateEmployeeDto: UpdateEmployeeDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
    remove(id: number, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
    changeStatus(id: number, dto: ChangeEmployeeStatusDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
    assignProject(id: number, dto: AssignProjectDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
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
        };
    }>;
}
