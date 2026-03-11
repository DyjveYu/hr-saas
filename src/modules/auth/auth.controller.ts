import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';

@ApiTags('认证模块')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 登录接口
   */
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '用户登录', description: '使用用户名密码登录获取token' })
  @ApiResponse({ status: 200, description: '登录成功返回token' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 登出接口
   */
  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '用户登出', description: '退出登录，使token失效' })
  @ApiResponse({ status: 200, description: '登出成功' })
  async logout(@Request() req) {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    await this.authService.logout(accessToken, req.user.userId);
    return {
      code: 0,
      message: 'success',
    };
  }

  /**
   * 刷新 Token 接口
   */
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: '刷新Token', description: '使用refresh_token刷新access_token' })
  @ApiResponse({ status: 200, description: '刷新成功返回新的access_token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refresh(refreshTokenDto);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 获取当前用户信息
   */
  @Get('info')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取当前用户信息', description: '获取当前登录用户的信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserInfo(@Request() req) {
    const result = await this.authService.getUserInfo(req.user.userId);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }
}
