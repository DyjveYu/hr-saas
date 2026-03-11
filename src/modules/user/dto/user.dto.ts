import { IsString, IsOptional, IsEnum, MinLength, IsNumber, IsNotEmpty } from 'class-validator';
import { Role, UserStatus } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role = 'COMPANY_ADMIN';

  @IsString()
  @IsOptional()
  realName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsNumber()
  @IsOptional()
  tenantId?: number;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  realName?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class SetPaymentPasswordDto {
  @IsString()
  @MinLength(6)
  paymentPassword: string;
}

export class ChangeStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;
}
