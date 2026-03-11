import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetPresignDto, GetSignedUrlDto } from './dto/file.dto';
export declare class FileService {
    private configService;
    private prisma;
    private ossEnabled;
    private bucket;
    private endpoint;
    private region;
    constructor(configService: ConfigService, prisma: PrismaService);
    getPresignUrl(dto: GetPresignDto, tenantId: number): Promise<{
        uploadUrl: string;
        fileKey: string;
        expires: number;
        isMock: boolean;
    }>;
    getSignedUrl(dto: GetSignedUrlDto, tenantId: number, role: string): Promise<{
        signedUrl: string;
        expires: number;
        isMock: boolean;
    }>;
    private checkFileAccessPermission;
    generateProjectQrCode(projectId: number, tenantId: number): Promise<{
        qrCodeUrl: string;
    }>;
}
