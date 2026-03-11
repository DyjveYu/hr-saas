import { IsString, IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { RechargeStatus } from '@prisma/client';

export class CreateRechargeOrderDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  transferVoucherUrl?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

export class QueryRechargeOrderDto {
  @IsEnum(RechargeStatus)
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  status?: RechargeStatus;

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
