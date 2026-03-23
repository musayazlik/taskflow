import { Module } from "@nestjs/common";

import { TasksController } from "./tasks.controller";
import { TasksGateway } from "./tasks.gateway";
import { TasksRealtimeService } from "./tasks-realtime.service";
import { TasksService } from "./tasks.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [TasksController],
  providers: [TasksService, TasksGateway, TasksRealtimeService],
})
export class TasksModule {}

