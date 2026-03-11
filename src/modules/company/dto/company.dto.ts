import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CompanyStatus } from '@prisma/client';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  shortName?: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  address?: string;

  // 企业管理员信息
  @IsString()
  @IsOptional()
  adminUsername?: string;

  @IsString()
  @IsOptional()
  adminPassword?: string;

  @IsString()
  @IsOptional()
  adminRealName?: string;

  @IsString()
  @IsOptional()
  adminPhone?: string;
}

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  shortName?: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class ChangeCompanyStatusDto {
  @IsEnum(CompanyStatus)
  status: CompanyStatus;
}

export class QueryCompanyDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  name?: string;

  @IsEnum(CompanyStatus)
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  status?: CompanyStatus;

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
