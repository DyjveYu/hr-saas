import { HttpException } from '@nestjs/common';
export declare class BusinessException extends HttpException {
    readonly code: number;
    readonly message: string;
    readonly data: any;
    constructor(code: number, message: string, data?: any);
}
export declare const ErrorCodes: {
    readonly SYSTEM_ERROR: 1000;
    readonly PARAM_ERROR: 1001;
    readonly RESOURCE_NOT_FOUND: 1002;
    readonly FORBIDDEN: 1003;
    readonly UNAUTHORIZED: 1004;
    readonly TOKEN_EXPIRED: 1005;
    readonly ACCOUNT_LOCKED: 1006;
    readonly ACCOUNT_DISABLED: 1007;
    readonly INSUFFICIENT_BALANCE: 2001;
    readonly PAYMENT_PASSWORD_ERROR: 2002;
    readonly ACCOUNT_FROZEN: 2003;
    readonly PROJECT_DISABLED: 2004;
    readonly EMPLOYEE_NOT_FOUND: 2005;
    readonly EXCEED_PAYROLL_LIMIT: 2006;
    readonly DUPLICATE_SUBMIT: 2007;
    readonly COMPANY_DISABLED: 2009;
    readonly USERNAME_EXISTS: 2010;
};
