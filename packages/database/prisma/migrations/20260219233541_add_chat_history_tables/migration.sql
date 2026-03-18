-- ============================================
-- Add Chat History Tables
-- ============================================

-- Create ChatSession table
CREATE TABLE "chat_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_session_pkey" PRIMARY KEY ("id")
);

-- Create ChatSessionMessage table
CREATE TABLE "chat_session_message" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_session_message_pkey" PRIMARY KEY ("id")
);

-- Create indexes for ChatSession
CREATE INDEX "chat_session_userId_idx" ON "chat_session"("userId");
CREATE INDEX "chat_session_userId_isActive_idx" ON "chat_session"("userId", "isActive");
CREATE INDEX "chat_session_createdAt_idx" ON "chat_session"("createdAt");

-- Create indexes for ChatSessionMessage
CREATE INDEX "chat_session_message_sessionId_idx" ON "chat_session_message"("sessionId");
CREATE INDEX "chat_session_message_sessionId_createdAt_idx" ON "chat_session_message"("sessionId", "createdAt");

-- Add foreign key constraints
ALTER TABLE "chat_session" ADD CONSTRAINT "chat_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_session_message" ADD CONSTRAINT "chat_session_message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "chat_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
