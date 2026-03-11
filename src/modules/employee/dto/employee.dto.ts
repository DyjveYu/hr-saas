import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsEmail } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { EmployeeStatus } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  name: string;

  @IsString()
  idCard: string;

  @IsString()
  phone: string;

  @IsNumber()
  @IsOptional()
  projectId?: number;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  emergencyPhone?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  emergencyPhone?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

export class ChangeEmployeeStatusDto {
  @IsEnum(EmployeeStatus)
  status: EmployeeStatus;
}

export class AssignProjectDto {
  @IsNumber()
  projectId: number;
}

export class QueryEmployeeDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  name?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  projectId?: number;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  status?: EmployeeStatus;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;
}
