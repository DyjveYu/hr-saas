"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const business_exception_1 = require("../exceptions/business.exception");
let HttpExceptionFilter = class HttpExceptionFilter {
    logger = new common_1.Logger('Exception');
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let code;
        let message;
        let data = null;
        if (exception instanceof business_exception_1.BusinessException) {
            code = exception.code;
            message = exception.message;
            data = exception.data;
        }
        else if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' &&
                exceptionResponse !== null &&
                'code' in exceptionResponse) {
                const resp = exceptionResponse;
                code = typeof resp.code === 'number' ? resp.code : business_exception_1.ErrorCodes.PARAM_ERROR;
                message = typeof resp.message === 'string' ? resp.message : '参数错误';
            }
            else if (status === common_1.HttpStatus.UNAUTHORIZED) {
                code = business_exception_1.ErrorCodes.UNAUTHORIZED;
                message = '认证失败，请重新登录';
            }
            else if (status === common_1.HttpStatus.FORBIDDEN) {
                code = business_exception_1.ErrorCodes.FORBIDDEN;
                message = '权限不足';
            }
            else if (status === common_1.HttpStatus.NOT_FOUND) {
                code = business_exception_1.ErrorCodes.RESOURCE_NOT_FOUND;
                message = '资源不存在';
            }
            else if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
                code = business_exception_1.ErrorCodes.PARAM_ERROR;
                const msgs = exceptionResponse.message;
                message = Array.isArray(msgs) ? msgs.join('; ') : String(msgs);
            }
            else {
                code = business_exception_1.ErrorCodes.SYSTEM_ERROR;
                message = '系统错误';
            }
        }
        else if (exception instanceof Error) {
            code = business_exception_1.ErrorCodes.SYSTEM_ERROR;
            message = '系统错误';
            const isProduction = process.env.NODE_ENV === 'production';
            if (!isProduction) {
                this.logger.error(`[SYSTEM ERROR] ${exception.message}`, exception.stack);
            }
            else {
                this.logger.error(`[SYSTEM ERROR] ${exception.message}`);
            }
        }
        else {
            code = business_exception_1.ErrorCodes.SYSTEM_ERROR;
            message = '系统错误';
            this.logger.error('[UNKNOWN ERROR]', String(exception));
        }
        const result = {
            code,
            message,
            data,
        };
        this.logger.error(`[${request.method}] ${request.url} - code: ${code}, message: ${message}`);
        response.status(common_1.HttpStatus.OK).json(result);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map