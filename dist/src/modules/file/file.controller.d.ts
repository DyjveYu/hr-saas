import { FileService } from './file.service';
import { GetPresignDto, GetSignedUrlDto } from './dto/file.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class FileController {
    private readonly fileService;
    constructor(fileService: FileService);
    getPresignUrl(dto: GetPresignDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
            uploadUrl: string;
            fileKey: string;
            expires: number;
            isMock: boolean;
        };
    }>;
    getSignedUrl(dto: GetSignedUrlDto, user: JwtPayload): Promise<{
        code: number;
        message: string;
        data: {
            signedUrl: string;
            expires: number;
            isMock: boolean;
        };
    }>;
}
