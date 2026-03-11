import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto, SetPaymentPasswordDto, ChangeStatusDto } from './dto/user.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: number | null, role: string): Promise<{
        id: bigint;
        username: string;
        tenantId: bigint | null;
        role: import("@prisma/client").$Enums.Role;
        realName: string | null;
        phone: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(createUserDto: CreateUserDto, currentUserTenantId: number | null, currentUserRole: string): Promise<{
        id: bigint;
        username: string;
        tenantId: bigint | null;
        role: import("@prisma/client").$Enums.Role;
        realName: string | null;
        phone: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, updateUserDto: UpdateUserDto, currentUserTenantId: number | null, currentUserRole: string): Promise<{
        id: bigint;
        username: string;
        tenantId: bigint | null;
        role: import("@prisma/client").$Enums.Role;
        realName: string | null;
        phone: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number, currentUserTenantId: number | null, currentUserRole: string): Promise<{
        id: bigint;
        username: string;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    changePassword(id: number, dto: ChangePasswordDto, currentUserTenantId: number | null, currentUserRole: string): Promise<{
        message: string;
    }>;
    setPaymentPassword(id: number, dto: SetPaymentPasswordDto, currentUserTenantId: number | null, currentUserRole: string): Promise<{
        message: string;
    }>;
    changeStatus(id: number, dto: ChangeStatusDto, currentUserTenantId: number | null, currentUserRole: string): Promise<{
        id: bigint;
        username: string;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    private checkPermission;
}
