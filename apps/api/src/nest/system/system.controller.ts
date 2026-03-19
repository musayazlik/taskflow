import { Controller, Get, UseGuards } from "@nestjs/common";

import { successResponse } from "@api/lib/route-helpers";
import * as systemService from "@api/services/system.service";

import { BetterAuthGuard } from "../auth/better-auth.guard";
import { AdminGuard } from "../auth/role.guards";

@Controller("/api/system")
@UseGuards(BetterAuthGuard, AdminGuard)
export class SystemController {
  @Get("/stats")
  async getStats() {
    const systemInfo = await systemService.getSystemInfo();
    return successResponse(systemInfo);
  }
}

