import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as winston from 'winston';
export declare class LoggingInterceptor implements NestInterceptor {
    private readonly logger;
    constructor(logger: winston.Logger);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
