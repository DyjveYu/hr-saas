import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret',
    });
    this.redis = new Redis({
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT'),
      password: configService.get<string>('REDIS_PASSWORD'),
      lazyConnect: true,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // 检查 token 是否在黑名单中
    const blacklistKey = `blacklist:${payload.userId}:${payload.iat}`;
    const isBlacklisted = await this.redis.get(blacklistKey);

    if (isBlacklisted) {
      throw new UnauthorizedException({
        code: 1004,
        message: 'Token 已失效，请重新登录',
      });
    }

    return {
      userId: payload.userId,
      tenantId: payload.tenantId,
      role: payload.role,
    };
  }
}
