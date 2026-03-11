import { IsString, IsOptional, IsEnum } from 'class-validator';

export class GetPresignDto {
  @IsEnum(['id_card_front', 'id_card_back', 'voucher', 'qrcode'])
  fileType: 'id_card_front' | 'id_card_back' | 'voucher' | 'qrcode';

  @IsString()
  bizId: string;
}

export class GetSignedUrlDto {
  @IsString()
  fileKey: string;
}
