import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException, ErrorCodes } from '../exceptions/business.exception';

/**
 * 全局异常过滤器
 * 捕获所有异常，统一返回格式
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let code: number;
    let message: string;
    let data: any = null;

    // 判断异常类型
    if (exception instanceof BusinessException) {
      // 业务异常
      code = exception.code;
      message = exception.message;
      data = exception.data;
    } else if (exception instanceof HttpException) {
      // HTTP 异常
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // 检查是否包含自定义错误码
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'code' in exceptionResponse
      ) {
        // 使用异常中指定的错误码
        const resp = exceptionResponse as any;
        code = typeof resp.code === 'number' ? resp.code : ErrorCodes.PARAM_ERROR;
        message = typeof resp.message === 'string' ? resp.message : '参数错误';
      } else if (status === HttpStatus.UNAUTHORIZED) {
        code = ErrorCodes.UNAUTHORIZED;
        message = '认证失败，请重新登录';
      } else if (status === HttpStatus.FORBIDDEN) {
        code = ErrorCodes.FORBIDDEN;
        message = '权限不足';
      } else if (status === HttpStatus.NOT_FOUND) {
        code = ErrorCodes.RESOURCE_NOT_FOUND;
        message = '资源不存在';
      } else if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        // 参数校验错误
        code = ErrorCodes.PARAM_ERROR;
        const msgs = exceptionResponse.message;
        message = Array.isArray(msgs) ? msgs.join('; ') : String(msgs);
      } else {
        code = ErrorCodes.SYSTEM_ERROR;
        message = '系统错误';
      }
    } else if (exception instanceof Error) {
      // 其他系统异常
      code = ErrorCodes.SYSTEM_ERROR;
      message = '系统错误';

      // 生产环境记录堆栈信息
      const isProduction = process.env.NODE_ENV === 'production';
      if (!isProduction) {
        this.logger.error(`[SYSTEM ERROR] ${exception.message}`, exception.stack);
      } else {
        this.logger.error(`[SYSTEM ERROR] ${exception.message}`);
      }
    } else {
      // 未知异常
      code = ErrorCodes.SYSTEM_ERROR;
      message = '系统错误';
      this.logger.error('[UNKNOWN ERROR]', String(exception));
    }

    // 构造响应
    const result = {
      code,
      message,
      data,
    };

    // 记录错误日志
    this.logger.error(
      `[${request.method}] ${request.url} - code: ${code}, message: ${message}`,
    );

    // 返回统一格式
    response.status(HttpStatus.OK).json(result);
  }
}
