"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const logger_module_1 = require("./common/logger/logger.module");
const prisma_module_1 = require("./common/prisma/prisma.module");
const redis_module_1 = require("./common/redis.module");
const auth_module_1 = require("./modules/auth/auth.module");
const test_module_1 = require("./modules/test/test.module");
const user_module_1 = require("./modules/user/user.module");
const company_module_1 = require("./modules/company/company.module");
const project_module_1 = require("./modules/project/project.module");
const employee_module_1 = require("./modules/employee/employee.module");
const file_module_1 = require("./modules/file/file.module");
const account_module_1 = require("./modules/account/account.module");
const recharge_module_1 = require("./modules/recharge/recharge.module");
const transaction_module_1 = require("./modules/transaction/transaction.module");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            logger_module_1.LoggerModule,
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            auth_module_1.AuthModule,
            test_module_1.TestModule,
            user_module_1.UserModule,
            company_module_1.CompanyModule,
            project_module_1.ProjectModule,
            employee_module_1.EmployeeModule,
            file_module_1.FileModule,
            account_module_1.AccountModule,
            recharge_module_1.RechargeModule,
            transaction_module_1.TransactionModule,
        ],
        providers: [
            logging_interceptor_1.LoggingInterceptor,
            response_interceptor_1.ResponseInterceptor,
            http_exception_filter_1.HttpExceptionFilter,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map