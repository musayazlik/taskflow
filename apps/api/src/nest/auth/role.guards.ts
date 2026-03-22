import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { AppError } from "@api/lib/errors";
import { isAdminRole } from "@api/lib/auth-roles";

import type { RequestWithSession } from "./better-auth.guard";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithSession>();
    const session = req.betterAuthSession;

    if (!session) {
      throw new AppError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (!isAdminRole(session.user.role)) {
      throw new AppError("FORBIDDEN", "Admin access required", 403);
    }

    return true;
  }
}

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithSession>();
    const session = req.betterAuthSession;

    if (!session) {
      throw new AppError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (session.user.role !== "SUPER_ADMIN") {
      throw new AppError("FORBIDDEN", "Super admin access required", 403);
    }

    return true;
  }
}

