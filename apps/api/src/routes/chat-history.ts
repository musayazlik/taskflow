import { Elysia, t } from "elysia";
import * as chatHistoryService from "@api/services/chat-history.service";
import { AppError } from "@api/lib/errors";
import {
  parsePagination,
  paginatedResponse,
  successResponse,
  requireAuth,
} from "@api/lib/route-helpers";

export const chatHistoryRoutes = new Elysia({ prefix: "/chat-history" })
  // Get user's chat sessions
  .get(
    "/sessions",
    async ({ query, request: { headers } }) => {
      const session = await requireAuth(headers);
      const userId = session.user.id;

      const { page, limit } = parsePagination(query);
      const isActive =
        query.isActive === "true"
          ? true
          : query.isActive === "false"
            ? false
            : undefined;

      const result = await chatHistoryService.getUserChatSessions(userId, {
        page,
        limit,
        isActive,
      });

      return paginatedResponse(
        result.sessions,
        result.total,
        result.page,
        result.limit,
      );
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        isActive: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Chat History"],
        summary: "List user's chat sessions",
        description: "Returns paginated list of user's chat sessions",
      },
    },
  )

  // Get specific chat session with messages
  .get(
    "/sessions/:id",
    async ({ params, request: { headers } }) => {
      const session = await requireAuth(headers);
      const userId = session.user.id;

      const chatSession = await chatHistoryService.getChatSessionById(
        params.id,
        userId,
      );

      if (!chatSession) {
        throw new AppError(
          "CHAT_SESSION_NOT_FOUND",
          "Chat session not found",
          404,
        );
      }

      return successResponse(chatSession);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Chat History"],
        summary: "Get chat session by ID",
        description: "Returns a chat session with all its messages",
      },
    },
  )

  // Create new chat session
  .post(
    "/sessions",
    async ({ body, request: { headers } }) => {
      const session = await requireAuth(headers);
      const userId = session.user.id;

      const chatSession = await chatHistoryService.createChatSession(userId, body);
      return successResponse(chatSession);
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 200 }),
        modelId: t.String({ minLength: 1 }),
      }),
      detail: {
        tags: ["Chat History"],
        summary: "Create chat session",
        description: "Creates a new chat session",
      },
    },
  )

  // Update chat session
  .patch(
    "/sessions/:id",
    async ({ params, body, request: { headers } }) => {
      const session = await requireAuth(headers);
      const userId = session.user.id;

      const chatSession = await chatHistoryService.updateChatSession(
        params.id,
        userId,
        body,
      );
      return successResponse(chatSession);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: {
        tags: ["Chat History"],
        summary: "Update chat session",
        description: "Updates a chat session (title or active status)",
      },
    },
  )

  // Delete chat session
  .delete(
    "/sessions/:id",
    async ({ params, request: { headers } }) => {
      const session = await requireAuth(headers);
      const userId = session.user.id;

      await chatHistoryService.deleteChatSession(params.id, userId);
      return {
        success: true,
        message: "Chat session deleted successfully",
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Chat History"],
        summary: "Delete chat session",
        description: "Deletes a chat session and all its messages",
      },
    },
  )

  // Add message to chat session
  .post(
    "/messages",
    async ({ body, request: { headers } }) => {
      const session = await requireAuth(headers);
      const userId = session.user.id;

      const message = await chatHistoryService.addChatMessage(body, userId);
      return successResponse(message);
    },
    {
      body: t.Object({
        sessionId: t.String(),
        role: t.Union([
          t.Literal("user"),
          t.Literal("assistant"),
          t.Literal("system"),
        ]),
        content: t.String({ minLength: 1 }),
        tokensUsed: t.Optional(t.Number()),
      }),
      detail: {
        tags: ["Chat History"],
        summary: "Add chat message",
        description: "Adds a message to a chat session",
      },
    },
  )

  // Get chat messages
  .get(
    "/sessions/:id/messages",
    async ({ params, request: { headers } }) => {
      const session = await requireAuth(headers);
      const userId = session.user.id;

      const messages = await chatHistoryService.getChatMessages(
        params.id,
        userId,
      );
      return successResponse(messages);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Chat History"],
        summary: "Get chat messages",
        description: "Returns all messages for a chat session",
      },
    },
  );
