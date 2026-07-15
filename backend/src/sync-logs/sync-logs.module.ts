import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncLog, SyncLogSchema } from './schemas/sync-log.schema';
import { SyncLogsService } from './sync-logs.service';
import { SyncLogsController } from './sync-logs.controller';
import { UsersModule } from '../users/users.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: SyncLog.name, schema: SyncLogSchema }]),
    UsersModule, // For RolesGuard UsersService dependency
  ],
  controllers: [SyncLogsController],
  providers: [SyncLogsService],
  exports: [SyncLogsService],
})
export class SyncLogsModule {}
