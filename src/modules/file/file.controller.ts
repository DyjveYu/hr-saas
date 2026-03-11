import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FileService } from './file.service';
import { GetPresignDto, GetSignedUrlDto } from './dto/file.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('文件模块')
@ApiBearerAuth('JWT-auth')
@Controller('files')
@UseGuards(AuthGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  /**
   * 获取上传凭证
   */
  @Post('presign')
  @ApiOperation({ summary: '获取上传凭证', description: '获取OSS预签名上传URL' })
  @ApiResponse({ status: 201, description: '获取成功' })
  async getPresignUrl(
    @Body() dto: GetPresignDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.fileService.getPresignUrl(dto, user.tenantId!);
    return { code: 0, message: 'success', data: result };
  }

  /**
   * 获取私有文件访问 URL
   */
  @Get('signed-url')
  @ApiOperation({ summary: '获取私有文件访问URL', description: '获取OSS预签名下载URL（用于访问敏感文件）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSignedUrl(
    @Query() dto: GetSignedUrlDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.fileService.getSignedUrl(dto, user.tenantId!, user.role);
    return { code: 0, message: 'success', data: result };
  }
}
