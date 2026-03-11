import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TransactionType, TransactionDirection } from '@prisma/client';

export class QueryTransactionDto {
  @IsEnum(TransactionType)
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  type?: TransactionType;

  @IsEnum(TransactionDirection)
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  direction?: TransactionDirection;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  startDate?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  endDate?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  tenantId?: number;

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
