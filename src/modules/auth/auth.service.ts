import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthModule');
  private redis: Redis;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT'),
      password: configService.get<string>('REDIS_PASSWORD'),
      lazyConnect: true,
    });
  }

  /**
   * 登录接口
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 查询用户
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 1001,
        message: '用户名或密码错误',
      });
    }

    // 检查账号状态
    if (user.status === 'DISABLED') {
      throw new UnauthorizedException({
        code: 1007,
        message: '账号已禁用',
      });
    }

    // 检查公司状态（ COMPANY_ADMIN 需要检查）
    if (user.tenantId && user.role === 'COMPANY_ADMIN') {
      const company = await this.prisma.company.findUnique({
        where: { id: user.tenantId },
      });
      if (company && company.status === 'INACTIVE') {
        throw new UnauthorizedException({
          code: 2009,
          message: '公司已停用',
        });
      }
    }

    // 检查是否在锁定期内
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      throw new UnauthorizedException({
        code: 1006,
        message: '账号已锁定，请稍后重试',
      });
    }

    // 校验密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // 密码错误，增加失败次数
      const newFailCount = user.loginFailCount + 1;

      const updateData: { loginFailCount: number; lockedUntil?: Date | null } = {
        loginFailCount: newFailCount,
      };

      if (newFailCount >= 5) {
        // 达到 5 次，锁定 15 分钟
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      if (updateData.lockedUntil) {
        throw new UnauthorizedException({
          code: 1006,
          message: '账号已锁定，请稍后重试',
        });
      }

      throw new UnauthorizedException({
        code: 1001,
        message: '用户名或密码错误',
      });
    }

    // 密码正确，重置失败次数，更新最后登录时间
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginFailCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // 生成 token payload (转换为普通 number 类型)
    const payload = {
      userId: Number(user.id),
      tenantId: user.tenantId ? Number(user.tenantId) : null,
      role: user.role as string,
    };

    // 生成 access_token
    const accessToken = this.jwtService.sign(payload);

    // 生成 refresh_token
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    // 将 refresh_token 存入 Redis
    const refreshExpire = 7 * 24 * 60 * 60; // 7 天
    await this.redis.setex(`refresh:${user.id}`, refreshExpire, refreshToken);

    // 记录登录日志
    this.logger.log(`用户登录成功 - userId: ${user.id}, username: ${user.username}, role: ${user.role}`);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * 获取当前用户信息
   */
  async getUserInfo(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        realName: true,
        phone: true,
        role: true,
        tenantId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 1002,
        message: '资源不存在',
      });
    }

    // 如果是企业管理员，获取企业信息
    let tenantName: string | undefined;
    if (user.tenantId) {
      const tenant = await this.prisma.company.findUnique({
        where: { id: user.tenantId },
        select: { name: true },
      });
      tenantName = tenant?.name;
    }

    return {
      ...user,
      tenantName,
    };
  }

  /**
   * 登出接口
   */
  async logout(accessToken: string, userId: number) {
    try {
      // 解析 token 获取 iat
      const decoded = this.jwtService.verify(accessToken);

      // 将 access_token 加入黑名单
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await this.redis.setex(`blacklist:${userId}:${decoded.iat}`, ttl, '1');
      }

      // 删除 refresh_token
      await this.redis.del(`refresh:${userId}`);

      // 记录登出日志
      this.logger.log(`用户登出 - userId: ${userId}`);

      return { code: 0, message: 'success' };
    } catch (error) {
      // token 无效也返回成功
      return { code: 0, message: 'success' };
    }
  }

  /**
   * 刷新 Token 接口
   */
  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { refresh_token } = refreshTokenDto;

    try {
      // 验证 refresh_token
      const decoded = this.jwtService.verify(refresh_token);
      const userId = decoded.userId;

      // 检查 Redis 中是否存在该 token
      const storedToken = await this.redis.get(`refresh:${userId}`);
      if (!storedToken || storedToken !== refresh_token) {
        throw new UnauthorizedException({
          code: 1004,
          message: 'Token 已失效',
        });
      }

      // 生成新的 access_token
      const payload = {
        userId: decoded.userId,
        tenantId: decoded.tenantId,
        role: decoded.role as string,
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        access_token: accessToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException({
        code: 1005,
        message: 'Token 已过期',
      });
    }
  }
}
