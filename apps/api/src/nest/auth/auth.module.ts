import { Module } from "@nestjs/common";

import { UserController } from "./user.controller";
import { BetterAuthGuard } from "./better-auth.guard";

@Module({
  controllers: [UserController],
  providers: [BetterAuthGuard],
})
export class AuthModule {}

