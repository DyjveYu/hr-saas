import { Role, UserStatus } from '@prisma/client';
export declare class CreateUserDto {
    username: string;
    password: string;
    role?: Role;
    realName?: string;
    phone?: string;
    tenantId?: number;
}
export declare class UpdateUserDto {
    realName?: string;
    phone?: string;
}
export declare class ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}
export declare class SetPaymentPasswordDto {
    paymentPassword: string;
}
export declare class ChangeStatusDto {
    status: UserStatus;
}
