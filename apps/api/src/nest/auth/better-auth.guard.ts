import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";

import { auth } from "@api/lib/auth";
import { AppError } from "@api/lib/errors";

import type { RequestWithRequestId } from "../middleware/request-id.middleware";

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export type RequestWithSession = RequestWithRequestId & {
  betterAuthSession?: Session;
};

@Injectable()
export class BetterAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithSession>();

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new AppError("UNAUTHORIZED", "Authentication required", 401);
    }

    req.betterAuthSession = session;
    return true;
  }
}

