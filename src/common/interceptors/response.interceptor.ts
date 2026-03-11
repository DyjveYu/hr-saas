import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: number;
  message: string;
  data: T;
}

interface WrappedResponse {
  code?: number;
  message?: string;
  data?: any;
}

/**
 * 统一响应格式拦截器
 * 将所有 Controller 返回值自动包装为 { code: 0, message: "success", data: ... }
 * 如果返回值已经被包装，则不再重复包装
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // 跳过 OPTIONS 预检请求
    if (method === 'OPTIONS') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // 检查是否已经被包装（判断是否有 code 和 message 字段）
        const isWrapped =
          data &&
          typeof data === 'object' &&
          'code' in data &&
          'message' in data &&
          'data' in data;

        if (isWrapped) {
          // 已经包装过，直接返回
          return data as Response<T>;
        }

        // 未包装，进行包装
        return {
          code: 0,
          message: 'success',
          data: data !== undefined ? data : null,
        } as Response<T>;
      }),
    );
  }
}
