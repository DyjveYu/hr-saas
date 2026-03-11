import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  siteManager?: string;

  @IsString()
  @IsOptional()
  siteManagerPhone?: string;

  @IsString()
  @IsOptional()
  financeManager?: string;

  @IsString()
  @IsOptional()
  financeManagerPhone?: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  siteManager?: string;

  @IsString()
  @IsOptional()
  siteManagerPhone?: string;

  @IsString()
  @IsOptional()
  financeManager?: string;

  @IsString()
  @IsOptional()
  financeManagerPhone?: string;
}

export class ChangeProjectStatusDto {
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}

export class QueryProjectDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  name?: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  status?: ProjectStatus;

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
