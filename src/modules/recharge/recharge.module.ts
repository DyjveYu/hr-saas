import { Module } from '@nestjs/common';
import { RechargeService } from './recharge.service';
import { RechargeController } from './recharge.controller';

@Module({
  providers: [RechargeService],
  controllers: [RechargeController],
  exports: [RechargeService],
})
export class RechargeModule {}
