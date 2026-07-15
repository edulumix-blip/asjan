import { Global, Module } from '@nestjs/common';
import { TaskTrackerService } from './task-tracker.service';

@Global()
@Module({
  providers: [TaskTrackerService],
  exports: [TaskTrackerService],
})
export class TaskTrackerModule {}
