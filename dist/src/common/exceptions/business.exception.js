"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = exports.BusinessException = void 0;
const common_1 = require("@nestjs/common");
class BusinessException extends common_1.HttpException {
    code;
    message;
    data;
    constructor(code, message, data = null) {
        super({
            code,
            message,
            data,
        }, common_1.HttpStatus.OK);
        this.code = code;
        this.message = message;
        this.data = data;
    }
}
exports.BusinessException = BusinessException;
exports.ErrorCodes = {
    SYSTEM_ERROR: 1000,
    PARAM_ERROR: 1001,
    RESOURCE_NOT_FOUND: 1002,
    FORBIDDEN: 1003,
    UNAUTHORIZED: 1004,
    TOKEN_EXPIRED: 1005,
    ACCOUNT_LOCKED: 1006,
    ACCOUNT_DISABLED: 1007,
    INSUFFICIENT_BALANCE: 2001,
    PAYMENT_PASSWORD_ERROR: 2002,
    ACCOUNT_FROZEN: 2003,
    PROJECT_DISABLED: 2004,
    EMPLOYEE_NOT_FOUND: 2005,
    EXCEED_PAYROLL_LIMIT: 2006,
    DUPLICATE_SUBMIT: 2007,
    COMPANY_DISABLED: 2009,
    USERNAME_EXISTS: 2010,
};
//# sourceMappingURL=business.exception.js.map