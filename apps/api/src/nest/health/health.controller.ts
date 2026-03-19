import { Controller, Get } from "@nestjs/common";

@Controller("/health")
export class HealthController {
  @Get("/")
  getHealth() {
    return {
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };
  }

  @Get("/ready")
  getReadiness() {
    const isDatabaseReady = true;

    if (!isDatabaseReady) {
      return {
        success: false,
        data: {
          status: "not_ready",
          timestamp: new Date().toISOString(),
          checks: {
            database: false,
          },
        },
      };
    }

    return {
      success: true,
      data: {
        status: "ready",
        timestamp: new Date().toISOString(),
        checks: {
          database: true,
        },
      },
    };
  }

  @Get("/live")
  getLiveness() {
    return {
      success: true,
      data: {
        status: "alive",
        timestamp: new Date().toISOString(),
      },
    };
  }
}

