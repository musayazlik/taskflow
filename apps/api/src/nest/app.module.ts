import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

import { RequestIdAndLoggingMiddleware } from "./middleware/request-id.middleware";
import { RateLimitMiddleware } from "./middleware/rate-limit.middleware";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { SettingsModule } from "./settings/settings.module";
import { SystemModule } from "./system/system.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { UsersModule } from "./users/users.module";
import { TasksModule } from "./tasks/tasks.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
  imports: [
    AuthModule,
    HealthModule,
    SettingsModule,
    SystemModule,
    DashboardModule,
    UsersModule,
    TasksModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestIdAndLoggingMiddleware, RateLimitMiddleware)
      .forRoutes("*");
  }
}

