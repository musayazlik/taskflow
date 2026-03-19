import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { AppError } from "@api/lib/errors";
import { BetterAuthGuard } from "../auth/better-auth.guard";
import type { RequestWithSession } from "../auth/better-auth.guard";
import {
  parsePagination,
  paginatedResponse,
  successResponse,
} from "@api/lib/route-helpers";
import * as chatHistoryService from "@api/services/chat-history.service";

@Controller("/api/chat-history")
@UseGuards(BetterAuthGuard)
export class ChatHistoryController {
  @Get("/sessions")
  async getSessions(
    @Req() req: RequestWithSession,
    @Query()
    query: { page?: string; limit?: string; isActive?: string },
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const userId = session.user.id;
    const { page, limit } = parsePagination(query);
    const isActive =
      query.isActive === "true" ? true : query.isActive === "false" ? false : undefined;

    const result = await chatHistoryService.getUserChatSessions(userId, {
      page,
      limit,
      isActive,
    });

    return paginatedResponse(result.sessions, result.total, result.page, result.limit);
  }

  @Get("/sessions/:id")
  async getSessionById(@Req() req: RequestWithSession, @Param("id") id: string) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const userId = session.user.id;
    const chatSession = await chatHistoryService.getChatSessionById(id, userId);
    if (!chatSession) {
      throw new AppError("CHAT_SESSION_NOT_FOUND", "Chat session not found", 404);
    }
    return successResponse(chatSession);
  }

  @Post("/sessions")
  async createSession(
    @Req() req: RequestWithSession,
    @Body() body: { title: string; modelId: string },
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const userId = session.user.id;
    const chatSession = await chatHistoryService.createChatSession(userId, body);
    return successResponse(chatSession);
  }

  @Patch("/sessions/:id")
  async updateSession(
    @Req() req: RequestWithSession,
    @Param("id") id: string,
    @Body() body: { title?: string; isActive?: boolean },
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const userId = session.user.id;
    const chatSession = await chatHistoryService.updateChatSession(id, userId, body);
    return successResponse(chatSession);
  }

  @Delete("/sessions/:id")
  async deleteSession(@Req() req: RequestWithSession, @Param("id") id: string) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const userId = session.user.id;
    await chatHistoryService.deleteChatSession(id, userId);
    return { success: true, message: "Chat session deleted successfully" };
  }

  @Post("/messages")
  async addMessage(
    @Req() req: RequestWithSession,
    @Body() body: {
      sessionId: string;
      role: "user" | "assistant" | "system";
      content: string;
      tokensUsed?: number;
    },
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const userId = session.user.id;
    const message = await chatHistoryService.addChatMessage(body, userId);
    return successResponse(message);
  }

  @Get("/sessions/:id/messages")
  async getMessages(
    @Req() req: RequestWithSession,
    @Param("id") id: string,
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const userId = session.user.id;
    const messages = await chatHistoryService.getChatMessages(id, userId);
    return successResponse(messages);
  }
}

