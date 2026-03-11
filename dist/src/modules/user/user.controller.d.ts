import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto, SetPaymentPasswordDto, ChangeStatusDto } from './dto/user.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findAll(user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
            id: bigint;
            username: string;
            tenantId: bigint | null;
            role: import("@prisma/client").$Enums.Role;
            realName: string | null;
            phone: string | null;
            status: import("@prisma/client").$Enums.UserStatus;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    create(createUserDto: CreateUserDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
            id: bigint;
            username: string;
            tenantId: bigint | null;
            role: import("@prisma/client").$Enums.Role;
            realName: string | null;
            phone: string | null;
            status: import("@prisma/client").$Enums.UserStatus;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    update(id: number, updateUserDto: UpdateUserDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
            id: bigint;
            username: string;
            tenantId: bigint | null;
            role: import("@prisma/client").$Enums.Role;
            realName: string | null;
            phone: string | null;
            status: import("@prisma/client").$Enums.UserStatus;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    remove(id: number, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
            id: bigint;
            username: string;
            status: import("@prisma/client").$Enums.UserStatus;
        };
    }>;
    changePassword(id: number, dto: ChangePasswordDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
            message: string;
        };
    }>;
    setPaymentPassword(id: number, dto: SetPaymentPasswordDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
            message: string;
        };
    }>;
    changeStatus(id: number, dto: ChangeStatusDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
            id: bigint;
            username: string;
            status: import("@prisma/client").$Enums.UserStatus;
        };
    }>;
}
