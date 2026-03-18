import { prisma } from "@repo/database";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import type {
  ChatSession,
  ChatSessionMessage,
  CreateChatSessionRequest,
  UpdateChatSessionRequest,
  AddChatMessageRequest,
} from "@repo/types";

export async function getUserChatSessions(
  userId: string,
  params: { page?: number; limit?: number; isActive?: boolean } = {},
): Promise<{
  sessions: ChatSession[];
  total: number;
  page: number;
  limit: number;
}> {
  const { page = 1, limit = 20, isActive } = params;
  const skip = (page - 1) * limit;

  try {
    const where: any = { userId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [sessions, total] = await Promise.all([
      prisma.chatSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.chatSession.count({ where }),
    ]);

    return { sessions, total, page, limit };
  } catch (error) {
    logger.error({ err: error, userId }, "Error fetching chat sessions");
    throw new AppError(
      "CHAT_SESSION_FETCH_ERROR",
      "Failed to fetch chat sessions",
      500,
    );
  }
}

export async function getChatSessionById(
  sessionId: string,
  userId: string,
): Promise<(ChatSession & { messages: ChatSessionMessage[] }) | null> {
  try {
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) return null;

    // Cast messages to proper type
    return {
      ...session,
      messages: session.messages.map((msg) => ({
        ...msg,
        role: msg.role as "user" | "assistant" | "system",
        tokensUsed: msg.tokensUsed ?? undefined,
      })),
    };
  } catch (error) {
    logger.error(
      { err: error, sessionId, userId },
      "Error fetching chat session",
    );
    throw new AppError(
      "CHAT_SESSION_FETCH_ERROR",
      "Failed to fetch chat session",
      500,
    );
  }
}

export async function createChatSession(
  userId: string,
  data: CreateChatSessionRequest,
): Promise<ChatSession> {
  try {
    const session = await prisma.chatSession.create({
      data: {
        userId,
        title: data.title,
        modelId: data.modelId,
        isActive: true,
      },
    });

    logger.info({ sessionId: session.id, userId }, "Chat session created");
    return session;
  } catch (error) {
    logger.error({ err: error, userId, data }, "Error creating chat session");
    throw new AppError(
      "CHAT_SESSION_CREATE_ERROR",
      "Failed to create chat session",
      500,
    );
  }
}

export async function updateChatSession(
  sessionId: string,
  userId: string,
  data: UpdateChatSessionRequest,
): Promise<ChatSession> {
  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new AppError(
        "CHAT_SESSION_NOT_FOUND",
        "Chat session not found",
        404,
      );
    }

    const updated = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date(),
      },
    });

    logger.info({ sessionId, userId }, "Chat session updated");
    return updated;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(
      { err: error, sessionId, userId, data },
      "Error updating chat session",
    );
    throw new AppError(
      "CHAT_SESSION_UPDATE_ERROR",
      "Failed to update chat session",
      500,
    );
  }
}

export async function deleteChatSession(
  sessionId: string,
  userId: string,
): Promise<void> {
  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new AppError(
        "CHAT_SESSION_NOT_FOUND",
        "Chat session not found",
        404,
      );
    }

    await prisma.chatSession.delete({
      where: { id: sessionId },
    });

    logger.info({ sessionId, userId }, "Chat session deleted");
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(
      { err: error, sessionId, userId },
      "Error deleting chat session",
    );
    throw new AppError(
      "CHAT_SESSION_DELETE_ERROR",
      "Failed to delete chat session",
      500,
    );
  }
}

export async function addChatMessage(
  data: AddChatMessageRequest,
  userId: string,
): Promise<ChatSessionMessage> {
  try {
    // Verify session belongs to user
    const session = await prisma.chatSession.findFirst({
      where: {
        id: data.sessionId,
        userId,
      },
    });

    if (!session) {
      throw new AppError(
        "CHAT_SESSION_NOT_FOUND",
        "Chat session not found or access denied",
        404,
      );
    }

    const message = await prisma.chatSessionMessage.create({
      data: {
        sessionId: data.sessionId,
        role: data.role,
        content: data.content,
        tokensUsed: data.tokensUsed,
      },
    });

    // Update session's updatedAt timestamp
    await prisma.chatSession.update({
      where: { id: data.sessionId },
      data: { updatedAt: new Date() },
    });

    // Cast to proper type
    return {
      ...message,
      role: message.role as "user" | "assistant" | "system",
      tokensUsed: message.tokensUsed ?? undefined,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error({ err: error, data, userId }, "Error adding chat message");
    throw new AppError(
      "CHAT_MESSAGE_CREATE_ERROR",
      "Failed to add chat message",
      500,
    );
  }
}

export async function getChatMessages(
  sessionId: string,
  userId: string,
): Promise<ChatSessionMessage[]> {
  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new AppError(
        "CHAT_SESSION_NOT_FOUND",
        "Chat session not found",
        404,
      );
    }

    const messages = await prisma.chatSessionMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    // Cast to proper type
    return messages.map((msg) => ({
      ...msg,
      role: msg.role as "user" | "assistant" | "system",
      tokensUsed: msg.tokensUsed ?? undefined,
    }));
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(
      { err: error, sessionId, userId },
      "Error fetching chat messages",
    );
    throw new AppError(
      "CHAT_MESSAGE_FETCH_ERROR",
      "Failed to fetch chat messages",
      500,
    );
  }
}
