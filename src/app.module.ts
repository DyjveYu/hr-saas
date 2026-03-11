import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './common/logger/logger.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { TestModule } from './modules/test/test.module';
import { UserModule } from './modules/user/user.module';
import { CompanyModule } from './modules/company/company.module';
import { ProjectModule } from './modules/project/project.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { FileModule } from './modules/file/file.module';
import { AccountModule } from './modules/account/account.module';
import { RechargeModule } from './modules/recharge/recharge.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    PrismaModule,
    RedisModule,
    AuthModule,
    TestModule,
    UserModule,
    CompanyModule,
    ProjectModule,
    EmployeeModule,
    FileModule,
    AccountModule,
    RechargeModule,
    TransactionModule,
  ],
  providers: [
    LoggingInterceptor,
    ResponseInterceptor,
    HttpExceptionFilter,
  ],
})
export class AppModule {}
