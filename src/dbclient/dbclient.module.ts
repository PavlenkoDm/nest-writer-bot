import { Global, Module } from '@nestjs/common';
import { DbClientService } from './dbclient.service';
import { DbClientOrderService } from './dbclient.order.service';
import { DbClientUserService } from './dbclient.user.service';

@Global()
@Module({
  providers: [DbClientService, DbClientOrderService, DbClientUserService],
  exports: [DbClientService, DbClientOrderService, DbClientUserService],
})
export class DbClientModule {}
