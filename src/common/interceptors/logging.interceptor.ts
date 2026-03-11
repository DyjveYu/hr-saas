import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import * as winston from 'winston';

/**
 * 日志拦截器
 * 记录请求日志，包括请求路径、方法、耗时、响应状态等
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: winston.Logger;

  constructor(@Inject(WINSTON_MODULE_PROVIDER) logger: winston.Logger) {
    this.logger = logger;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    const user = request.user;
    const now = Date.now();
    const module = headers['x-module'] || 'HTTP';

    // 记录请求进入
    this.logger.info('', {
      module,
      method,
      path: url,
      message: `[REQ] userId: ${user?.userId || 'guest'} - tenantId: ${user?.tenantId || 'N/A'}`,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - now;
          this.logger.info('', {
            module,
            method,
            path: url,
            message: `[RES] ${response.statusCode} - ${duration}ms`,
          });
        },
        error: (error) => {
          const duration = Date.now() - now;
          const statusCode = error?.status || error?.response?.status || 500;
          this.logger.error('', {
            module,
            method,
            path: url,
            errorCode: statusCode,
            errorMessage: error.message,
            stack: error.stack,
            message: `[ERR] ${duration}ms - ${error.message}`,
          });
        },
      }),
    );
  }
}
