import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

import { RequestIdAndLoggingMiddleware } from "./middleware/request-id.middleware";
import { RateLimitMiddleware } from "./middleware/rate-limit.middleware";
import { AiModule } from "./ai/ai.module";
import { AiModelsModule } from "./ai-models/ai-models.module";
import { AuthModule } from "./auth/auth.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { FileStorageModule } from "./file-storage/file-storage.module";
import { HealthModule } from "./health/health.module";
import { MediaModule } from "./media/media.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ProfileModule } from "./profile/profile.module";
import { SettingsModule } from "./settings/settings.module";
import { SystemModule } from "./system/system.module";
import { TasksModule } from "./tasks/tasks.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    AiModule,
    AiModelsModule,
    AuthModule,
    DashboardModule,
    FileStorageModule,
    HealthModule,
    MediaModule,
    NotificationsModule,
    ProfileModule,
    SettingsModule,
    SystemModule,
    TasksModule,
    UsersModule,
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

