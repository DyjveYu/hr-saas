import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 业务异常类
 * 用于抛出自定义错误码和错误信息的业务异常
 */
export class BusinessException extends HttpException {
  constructor(
    public readonly code: number,
    public readonly message: string,
    public readonly data: any = null,
  ) {
    super(
      {
        code,
        message,
        data,
      },
      HttpStatus.OK,
    );
  }
}

/**
 * 错误码定义
 * 系统错误码：1000-1999
 * 业务错误码：2000-9999
 */
export const ErrorCodes = {
  // 系统错误码
  SYSTEM_ERROR: 1000,
  PARAM_ERROR: 1001,
  RESOURCE_NOT_FOUND: 1002,
  FORBIDDEN: 1003,
  UNAUTHORIZED: 1004,
  TOKEN_EXPIRED: 1005,
  ACCOUNT_LOCKED: 1006,
  ACCOUNT_DISABLED: 1007,

  // 业务错误码
  INSUFFICIENT_BALANCE: 2001,
  PAYMENT_PASSWORD_ERROR: 2002,
  ACCOUNT_FROZEN: 2003,
  PROJECT_DISABLED: 2004,
  EMPLOYEE_NOT_FOUND: 2005,
  EXCEED_PAYROLL_LIMIT: 2006,
  DUPLICATE_SUBMIT: 2007,
  COMPANY_DISABLED: 2009,
  USERNAME_EXISTS: 2010,
} as const;
