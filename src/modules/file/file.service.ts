import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetPresignDto, GetSignedUrlDto } from './dto/file.dto';

@Injectable()
export class FileService {
  private ossEnabled: boolean;
  private bucket: string;
  private endpoint: string;
  private region: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // 检查 OSS 是否已配置
    this.ossEnabled = !!(
      this.configService.get<string>('OSS_ACCESS_KEY') &&
      this.configService.get<string>('OSS_SECRET_KEY') &&
      this.configService.get<string>('OSS_BUCKET') &&
      this.configService.get<string>('OSS_REGION')
    );

    this.bucket = this.configService.get<string>('OSS_BUCKET') || '';
    this.endpoint = this.configService.get<string>('OSS_ENDPOINT') || '';
    this.region = this.configService.get<string>('OSS_REGION') || '';
  }

  /**
   * 获取上传凭证
   */
  async getPresignUrl(dto: GetPresignDto, tenantId: number) {
    const { fileType, bizId } = dto;
    const timestamp = Date.now();
    const ext = 'jpg'; // 默认扩展名
    const env = this.configService.get<string>('NODE_ENV') || 'dev';

    // 生成文件 key: /{env}/{fileType}/{tenant_id}/{bizId}/{timestamp}.{ext}
    const fileKey = `${env}/${fileType}/${tenantId}/${bizId}/${timestamp}.${ext}`;

    // OSS 未配置时返回模拟 URL
    if (!this.ossEnabled) {
      return {
        uploadUrl: `http://localhost:3000/api/files/mock-upload?key=${fileKey}`,
        fileKey,
        expires: 600, // 10 分钟
        isMock: true,
      };
    }

    // 实际 OSS 预签名 URL（需要配置阿里云 OSS SDK）
    // 这里返回模拟 URL 作为占位
    return {
      uploadUrl: `https://${this.bucket}.${this.endpoint}/${fileKey}?mock=true`,
      fileKey,
      expires: 600,
      isMock: false,
    };
  }

  /**
   * 获取私有文件访问 URL
   */
  async getSignedUrl(dto: GetSignedUrlDto, tenantId: number, role: string) {
    const { fileKey } = dto;

    // 校验权限：只有本企业管理员可以访问身份证照片
    await this.checkFileAccessPermission(fileKey, tenantId, role);

    // OSS 未配置时返回模拟 URL
    if (!this.ossEnabled) {
      return {
        signedUrl: `http://localhost:3000/api/files/mock-download?key=${fileKey}`,
        expires: 300, // 5 分钟
        isMock: true,
      };
    }

    // 实际 OSS 签名 URL（需要配置阿里云 OSS SDK）
    return {
      signedUrl: `https://${this.bucket}.${this.endpoint}/${fileKey}?mock=true`,
      expires: 300,
      isMock: false,
    };
  }

  /**
   * 校验文件访问权限
   */
  private async checkFileAccessPermission(fileKey: string, tenantId: number, role: string) {
    // PLATFORM_ADMIN 可以访问所有文件
    if (role === 'PLATFORM_ADMIN') {
      return;
    }

    // 解析 fileKey 获取 tenantId
    // 格式: /{env}/{fileType}/{tenant_id}/{bizId}/{timestamp}.{ext}
    const parts = fileKey.split('/');
    if (parts.length < 4) {
      throw new BadRequestException({ code: 2005, message: '无效的文件 key' });
    }

    const fileTenantId = parseInt(parts[2], 10);

    // 身份证照片只有本企业管理员可访问
    if (parts[1]?.startsWith('id_card')) {
      if (fileTenantId !== tenantId) {
        throw new ForbiddenException({ code: 1003, message: '无权限访问该文件' });
      }
    }

    // 其他类型文件（本企业可访问）
    if (fileTenantId !== tenantId) {
      throw new ForbiddenException({ code: 1003, message: '无权限访问该文件' });
    }
  }

  /**
   * 生成项目二维码（本地模式）
   */
  async generateProjectQrCode(projectId: number, tenantId: number) {
    // 查找项目
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new BadRequestException({ code: 1002, message: '项目不存在' });
    }

    if (Number(project.tenantId) !== tenantId) {
      throw new ForbiddenException({ code: 1003, message: '无权限操作' });
    }

    // 生成二维码图片的模拟 URL
    const env = this.configService.get<string>('NODE_ENV') || 'dev';
    const qrCodeUrl = `https://mock-oss.example.com/${env}/qrcode/${tenantId}/${projectId}/qrcode.png`;

    // 更新项目的 qr_code_url
    await this.prisma.project.update({
      where: { id: projectId },
      data: { qrCodeUrl },
    });

    return { qrCodeUrl };
  }
}
