"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import "highlight.js/styles/github-dark.css";
import { useTheme } from "next-themes";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Zap,
  AlertCircle,
  Plus,
  History,
  ChevronLeft,
  MoreVertical,
  X,
  Clock,
  Image as ImageIcon,
  Mic,
  Square,
  Paperclip,
  Pencil,
  Save,
} from "lucide-react";
import { Button } from "@repo/shadcn-ui/button";
import { Textarea } from "@repo/shadcn-ui/textarea";
import { Card } from "@repo/shadcn-ui/card";
import { ScrollArea } from "@repo/shadcn-ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/select";
import { Slider } from "@repo/shadcn-ui/slider";
import { Label } from "@repo/shadcn-ui/label";
import { Switch } from "@repo/shadcn-ui/switch";
import { Input } from "@repo/shadcn-ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/shadcn-ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useActiveModels } from "@/stores/ai-models-store";
import { aiService } from "@/services/ai.service";
import { chatHistoryService } from "@/services/chat-history.service";
import { mediaService } from "@/services/media.service";
import type { ChatMessage, ChatSessionFrontend } from "@repo/types";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { PageHeader } from "@/components/panel/page-header";
import Image from "next/image";

interface MessageFile {
  type: "image" | "audio";
  url: string;
  name: string;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string; // Display content (always string for UI)
  timestamp: Date;
  files?: MessageFile[];
}

export default function AIChatPage() {
  const { theme } = useTheme();
  const activeModels = useActiveModels();
  const textModels = activeModels.filter(
    (m) => !m.modelId.includes("image") && !m.modelId.includes("dall-e"),
  );

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSessionFrontend[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  // Current chat state
  const [selectedModel, setSelectedModel] = useState<string>("");

  // Get selected model info (using useMemo to avoid initialization issues)
  const selectedModelInfo = useMemo(() => {
    return textModels.find((m) => m.modelId === selectedModel);
  }, [textModels, selectedModel]);

  // Check if model supports image/audio input
  const modelSupportsImage = useMemo(() => {
    return selectedModelInfo?.inputModalities?.includes("image") ?? false;
  }, [selectedModelInfo]);

  const modelSupportsAudio = useMemo(() => {
    return selectedModelInfo?.inputModalities?.includes("audio") ?? false;
  }, [selectedModelInfo]);

  const canAttachFiles = useMemo(() => {
    return modelSupportsImage || modelSupportsAudio;
  }, [modelSupportsImage, modelSupportsAudio]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [temperature, setTemperature] = useState([0.7]);
  const [showSettings, setShowSettings] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat sessions on mount
  useEffect(() => {
    loadChatSessions();
  }, []);

  // Auto-select first model
  useEffect(() => {
    if (textModels.length > 0 && !selectedModel) {
      setSelectedModel(textModels[0]!.modelId);
    }
  }, [textModels, selectedModel]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat sessions from database
  const loadChatSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const response = await chatHistoryService.getChatSessions({
        page: 1,
        limit: 50,
      });
      if (response.success && response.data) {
        const loadedSessions = response.data.data ?? [];
        setSessions(loadedSessions);

        // If no current session and there are sessions, load the most recent one
        if (!currentSessionId && loadedSessions.length > 0) {
          const mostRecent = loadedSessions[0];
          if (mostRecent) {
            await handleLoadSession(mostRecent.id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
      toast.error("Failed to load chat history");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Generate chat title from first message
  const generateChatTitle = async (
    firstMessage: string,
    modelId: string,
  ): Promise<string> => {
    if (!firstMessage || firstMessage.trim() === "") {
      return "New Chat";
    }

    try {
      const response = await aiService.chat({
        model: modelId,
        messages: [
          {
            role: "system",
            content:
              "Generate a concise, descriptive title (max 50 characters) for a chat conversation based on the user's first message. Return only the title text, no quotes, no explanation, no punctuation at the end.",
          },
          {
            role: "user",
            content: `Create a short title for this conversation: "${firstMessage.substring(0, 200)}"`,
          },
        ],
        temperature: 0.5,
        maxTokens: 30,
      });

      if (response.success && response.data) {
        // Handle both string and multimodal content
        const content = typeof response.data.content === "string"
          ? response.data.content
          : "";
        
        if (content) {
          // Clean up the title - remove quotes, trim, limit length
          let title = content.trim();
          title = title.replace(/^["']|["']$/g, ""); // Remove surrounding quotes
          title = title.replace(/\.$/, ""); // Remove trailing period
          title = title.replace(/^Title:\s*/i, ""); // Remove "Title:" prefix if present
          title = title.substring(0, 50); // Limit to 50 characters
          
          if (title && title.length > 0) {
            return title;
          }
        }
      }
    } catch (error) {
      console.error("Failed to generate chat title:", error);
    }
    return "New Chat";
  };

  // Start new chat
  const handleNewChat = async () => {
    if (!selectedModel) {
      toast.error("Please select a model first");
      return;
    }

    try {
      const response = await chatHistoryService.createChatSession({
        title: "New Chat",
        modelId: selectedModel,
      });

      if (response.success && response.data) {
        const newSession = response.data;
        // Add to beginning of list (most recent first)
        setSessions((prev) => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        setMessages([]);
        setInput("");
        setAttachedFiles([]);
        // Focus input after creating new chat
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 0);
      } else {
        toast.error(response.message || "Failed to create chat session");
      }
    } catch (error) {
      console.error("Failed to create chat session:", error);
      toast.error("Failed to start new chat");
    }
  };

  // Load chat session
  const handleLoadSession = async (sessionId: string) => {
    try {
      const response = await chatHistoryService.getChatSessionById(sessionId);
      if (response.success && response.data) {
        const session = response.data;
        setCurrentSessionId(session.id);
        setSelectedModel(session.modelId);

        // Convert messages from database
        const loadedMessages: Message[] = session.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
        }));
        setMessages(loadedMessages);

        // Update session in list to reflect it's the active one
        setSessions((prev) =>
          prev.map((s) => (s.id === session.id ? { ...s, ...session } : s)),
        );

        // Focus input after loading
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 0);
      } else {
        toast.error("Failed to load chat session");
      }
    } catch (error) {
      console.error("Failed to load chat session:", error);
      toast.error("Failed to load chat session");
    }
  };

  // Delete chat session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await chatHistoryService.deleteChatSession(sessionId);
      if (response.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          setMessages([]);
        }
        toast.success("Chat deleted");
      } else {
        toast.error(response.message || "Failed to delete chat");
      }
    } catch (error) {
      console.error("Failed to delete chat session:", error);
      toast.error("Failed to delete chat");
    }
  };

  // Save message to database
  const saveMessage = async (
    sessionId: string,
    role: "user" | "assistant" | "system",
    content: string,
  ) => {
    try {
      await chatHistoryService.addMessage({
        sessionId,
        role,
        content,
      });
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  };

  const handleSend = async () => {
    if (
      (!input.trim() && attachedFiles.length === 0) ||
      !selectedModel ||
      isLoading
    )
      return;

    // If no active session, create one
    if (!currentSessionId) {
      toast.error("Please start a new chat first");
      return;
    }

    // Upload files if any
    let uploadedFiles: MessageFile[] = [];
    if (attachedFiles.length > 0) {
      setIsUploadingFiles(true);
      try {
        const uploadResponse = await mediaService.uploadFiles(attachedFiles);
        if (uploadResponse.success && uploadResponse.data) {
          uploadedFiles = uploadResponse.data.map((file) => ({
            type: file.type.startsWith("image/") ? "image" : "audio",
            url: file.url,
            name: file.name,
          }));
        } else {
          toast.error(uploadResponse.message || "Failed to upload files");
          setIsUploadingFiles(false);
          return;
        }
      } catch (error) {
        console.error("File upload error:", error);
        toast.error("Failed to upload files");
        setIsUploadingFiles(false);
        return;
      } finally {
        setIsUploadingFiles(false);
      }
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim() || "",
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    };

    // Check if this is the first message (before adding to state)
    const isFirstMessage = messages.length === 0;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachedFiles([]); // Clear attached files after sending
    setIsLoading(true);

    // Create AbortController for this request
    abortControllerRef.current = new AbortController();

    // Save user message (only text content for database)
    const textContent = userMessage.content || "";
    await saveMessage(currentSessionId, "user", textContent);

    // Generate title from first message if this is the first message
    // Check if session title is still "New Chat" to avoid regenerating
    if (isFirstMessage && currentSessionId && selectedModel) {
      const sessionId = currentSessionId; // Capture for async callback
      const modelId = selectedModel; // Capture for async callback
      const currentSession = sessions.find((s) => s.id === sessionId);
      if (currentSession?.title === "New Chat") {
        // Get text content for title generation (use message content or file names)
        const titleSource = userMessage.content.trim() || 
          (userMessage.files && userMessage.files.length > 0
            ? userMessage.files.map((f) => f.name).join(", ")
            : "");
        
        // Only generate if we have content
        if (titleSource && titleSource.length > 0) {
          // Generate title asynchronously without blocking the chat
          generateChatTitle(titleSource, modelId)
            .then((title) => {
              if (title && title !== "New Chat" && title.length > 0) {
                chatHistoryService
                  .updateChatSession(sessionId, { title })
                  .then((response) => {
                    if (response.success && response.data) {
                      // Update session in the list with new title
                      setSessions((prev) =>
                        prev.map((s) => (s.id === sessionId ? response.data! : s)),
                      );
                    }
                  })
                  .catch((error) => {
                    console.error("Failed to update chat title:", error);
                  });
              }
            })
            .catch((error) => {
              console.error("Failed to generate chat title:", error);
            });
        }
      }
    }

    // Keep input focused after sending message
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);

    try {
      // Prepare messages for API with multimodal support
      const apiMessages: any[] = [
        ...messages.map((m) => {
          // If message has files, create multimodal content
          if (m.files && m.files.length > 0) {
            const content: any[] = [];
            if (m.content) {
              content.push({ type: "text", text: m.content });
            }
            for (const file of m.files) {
              if (file.type === "image") {
                content.push({
                  type: "image_url",
                  image_url: { url: file.url },
                });
              } else if (file.type === "audio") {
                content.push({
                  type: "audio_url",
                  audio_url: { url: file.url },
                });
              }
            }
            return { role: m.role, content };
          }
          return { role: m.role, content: m.content };
        }),
      ];

      // Add current user message with files if any
      if (userMessage.files && userMessage.files.length > 0) {
        const content: any[] = [];
        if (userMessage.content) {
          content.push({ type: "text", text: userMessage.content });
        }
        for (const file of userMessage.files) {
          if (file.type === "image") {
            content.push({
              type: "image_url",
              image_url: { url: file.url },
            });
          } else if (file.type === "audio") {
            content.push({
              type: "audio_url",
              audio_url: { url: file.url },
            });
          }
        }
        apiMessages.push({ role: userMessage.role, content });
      } else {
        apiMessages.push({
          role: userMessage.role,
          content: userMessage.content,
        });
      }

      if (streamingEnabled) {
        // Streaming mode
        const assistantMessageId = crypto.randomUUID();
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingMessageId(assistantMessageId);

        // Simulate streaming by chunking the response
        const response = await aiService.chat({
          model: selectedModel,
          messages: apiMessages as any,
          temperature: temperature[0],
        });

        if (response.success && response.data) {
          // Stream the content word by word
          const content = response.data.content;
          const words = content.split(" ");
          let currentContent = "";

          for (let i = 0; i < words.length; i++) {
            // Check if request was aborted
            if (abortControllerRef.current?.signal.aborted) {
              break;
            }
            currentContent += (i > 0 ? " " : "") + words[i];
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: currentContent }
                  : msg,
              ),
            );
            // Keep input focused during streaming
            if (textareaRef.current) {
              textareaRef.current.focus();
            }
            // Small delay for streaming effect
            await new Promise((resolve) => setTimeout(resolve, 30));
          }

          // If aborted, remove incomplete message
          if (abortControllerRef.current?.signal.aborted) {
            setMessages((prev) =>
              prev.filter((m) => m.id !== assistantMessageId),
            );
            setStreamingMessageId(null);
            return;
          }
          setStreamingMessageId(null);
          // Restore focus after streaming completes
          if (textareaRef.current) {
            textareaRef.current.focus();
          }

          // Save assistant message
          const assistantTextContent =
            typeof content === "string" ? content : "";
          await saveMessage(
            currentSessionId,
            "assistant",
            assistantTextContent,
          );

          // Refresh sessions to update updatedAt timestamp
          loadChatSessions();
        } else {
          toast.error(response.message || "Failed to get AI response");
          setMessages((prev) =>
            prev.filter((m) => m.id !== assistantMessageId),
          );
          setStreamingMessageId(null);
        }
      } else {
        // Normal mode
        const response = await aiService.chat({
          model: selectedModel,
          messages: apiMessages as any,
          temperature: temperature[0],
        });

        if (response.success && response.data) {
          const assistantContent =
            typeof response.data.content === "string"
              ? response.data.content
              : "";
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: assistantContent,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);

          // Save assistant message
          await saveMessage(currentSessionId, "assistant", assistantContent);

          // Refresh sessions to update updatedAt timestamp
          loadChatSessions();
        } else {
          toast.error(response.message || "Failed to get AI response");
          // Remove the user message if failed
          setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        }
      }
    } catch (error: any) {
      // Check if request was aborted
      if (
        error?.name === "AbortError" ||
        abortControllerRef.current?.signal.aborted
      ) {
        // Remove incomplete assistant message if streaming
        if (streamingMessageId) {
          setMessages((prev) =>
            prev.filter((m) => m.id !== streamingMessageId),
          );
          setStreamingMessageId(null);
        }
        return;
      }
      console.error("Chat error:", error);
      toast.error("An unexpected error occurred");
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      setStreamingMessageId(null);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      // Restore focus after response completes
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setAttachedFiles([]);
    toast.success("Chat cleared");
  };

  // Stop AI request
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setStreamingMessageId(null);
      toast.info("Request stopped");
    }
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types based on model capabilities
    const validFiles: File[] = [];
    for (const file of files) {
      if (file.type.startsWith("image/") && modelSupportsImage) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }
        validFiles.push(file);
      } else if (file.type.startsWith("audio/") && modelSupportsAudio) {
        if (file.size > 25 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 25MB)`);
          continue;
        }
        validFiles.push(file);
      } else {
        toast.error(`${file.name} is not supported by this model`);
      }
    }

    if (validFiles.length > 0) {
      setAttachedFiles((prev) => [...prev, ...validFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove attached file
  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Start editing session title
  const handleStartEditTitle = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  // Save edited title
  const handleSaveTitle = async (sessionId: string) => {
    if (!editingTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      const response = await chatHistoryService.updateChatSession(sessionId, {
        title: editingTitle.trim(),
      });

      if (response.success && response.data) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? response.data! : s)),
        );
        setEditingSessionId(null);
        setEditingTitle("");
        toast.success("Title updated");
      } else {
        toast.error(response.message || "Failed to update title");
      }
    } catch (error) {
      console.error("Failed to update title:", error);
      toast.error("Failed to update title");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={MessageSquare}
        title="AI Chat"
        description="Chat with AI models in real-time"
        actions={
          <>
            {!showSidebar && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSidebar(true)}
              >
                <History className="h-4 w-4 mr-2" />
                Show History
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleNewChat}>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background">
              <Label
                htmlFor="streaming-switch"
                className="text-sm cursor-pointer"
              >
                Streaming
              </Label>
              <Switch
                id="streaming-switch"
                checked={streamingEnabled}
                onCheckedChange={setStreamingEnabled}
                disabled={isLoading}
              />
            </div>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {textModels.length > 0 ? (
                  textModels.map((model) => (
                    <SelectItem key={model.id} value={model.modelId}>
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <span className="truncate">{model.name}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No models configured
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleClear}
              disabled={messages.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        }
      />

      {/* No Models Warning */}
      {textModels.length === 0 && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                No AI models configured
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Please configure AI models in the Model Settings page first.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Chat Layout with Sidebar */}
      <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[500px]">
        {/* Sidebar - Chat History */}
        <Card
          className={cn(
            "flex flex-col overflow-hidden transition-all duration-300 border-r py-0",
            showSidebar ? "w-80" : "w-0 opacity-0 pointer-events-none",
          )}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <History className="h-4 w-4 text-primary" />
                </div>
                <span className="font-semibold text-sm">Chat History</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowSidebar(false)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={handleNewChat}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Chat Sessions List */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1.5">
              {isLoadingSessions ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Loading chats...
                  </p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="p-3 rounded-full bg-muted mb-3">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No chat history</p>
                  <p className="text-xs text-muted-foreground">
                    Start a new conversation to see it here
                  </p>
                </div>
              ) : (
                sessions.map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        "group relative flex flex-col gap-1.5 p-3 rounded-xl transition-all duration-200",
                        currentSessionId === session.id
                          ? "bg-primary/10 border border-primary/20 shadow-sm"
                          : "hover:bg-muted/50 border border-transparent",
                        editingSessionId === session.id ? "" : "cursor-pointer",
                      )}
                      onClick={() => {
                        if (editingSessionId !== session.id) {
                          handleLoadSession(session.id);
                        }
                      }}
                    >
                    {/* Active Indicator */}
                    {currentSessionId === session.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                    )}

                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={cn(
                          "p-2 rounded-lg shrink-0",
                          currentSessionId === session.id
                            ? "bg-primary/20"
                            : "bg-muted",
                        )}
                      >
                        <MessageSquare
                          className={cn(
                            "h-4 w-4",
                            currentSessionId === session.id
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {editingSessionId === session.id ? (
                          <div className="flex items-center gap-2 mb-1">
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.stopPropagation();
                                  handleSaveTitle(session.id);
                                } else if (e.key === "Escape") {
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="h-7 text-sm"
                              autoFocus
                              maxLength={50}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveTitle(session.id);
                              }}
                            >
                              <Save className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <p
                            className={cn(
                              "text-sm font-medium truncate mb-1",
                              currentSessionId === session.id && "text-primary",
                            )}
                          >
                            {session.title}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{getRelativeTime(session.updatedAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {editingSessionId !== session.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditTitle(session.id, session.title);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSession(session.id);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}
          {sessions.length > 0 && (
            <div className="p-3 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                {sessions.length} {sessions.length === 1 ? "chat" : "chats"}
              </p>
            </div>
          )}
        </Card>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden py-0 relative">
          {/* Model Info Bar */}
          {selectedModelInfo && (
            <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 dark:bg-zinc-800/50 shrink-0">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-medium">{selectedModelInfo.name}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {(selectedModelInfo.contextLength / 1000).toFixed(0)}K context
                </span>
                {currentSessionId && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {messages.length} messages
                    </span>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                {showSettings ? "Hide Settings" : "Settings"}
              </Button>
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <div className="px-4 py-3 border-b bg-gray-50/50 dark:bg-zinc-800/30 shrink-0">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 flex-1 max-w-xs">
                  <Label className="shrink-0 text-sm">Temperature:</Label>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    min={0}
                    max={2}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-8">
                    {temperature[0]?.toFixed(1) ?? "0.0"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 mb-4">
                    <Sparkles className="h-8 w-8 text-violet-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Start a Conversation
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">
                    Select an AI model and start chatting. Your conversation
                    will be saved automatically.
                  </p>
                  <Button onClick={handleNewChat}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Chat
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start",
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-start">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 shrink-0">
                            <Bot className="h-4 w-4 text-violet-500" />
                          </div>
                        </div>
                      )}
                      <div
                        className={cn(
                          "group relative max-w-[80%] rounded-2xl px-4 py-3",
                          message.role === "user"
                            ? "bg-primary text-white"
                            : "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white",
                        )}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                code: ({
                                  node,
                                  inline,
                                  className,
                                  children,
                                  ...props
                                }: any) => {
                                  const match = /language-(\w+)/.exec(
                                    className || "",
                                  );
                                  return !inline && match ? (
                                    <pre className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 overflow-x-auto my-2">
                                      <code
                                        className={cn("text-sm", className)}
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    </pre>
                                  ) : (
                                    <code
                                      className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-xs font-mono"
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  );
                                },
                                p: ({ children }) => (
                                  <p className="mb-2 last:mb-0">{children}</p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc list-inside mb-2 space-y-1">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-inside mb-2 space-y-1">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="ml-2">{children}</li>
                                ),
                                h1: ({ children }) => (
                                  <h1 className="text-lg font-bold mb-2">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-base font-bold mb-2">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-sm font-bold mb-1">
                                    {children}
                                  </h3>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2">
                                    {children}
                                  </blockquote>
                                ),
                                a: ({ children, href }) => (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline"
                                  >
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                            {streamingMessageId === message.id && (
                              <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                            )}
                          </div>
                        ) : (
                          <>
                            {message.files && message.files.length > 0 && (
                              <div className="mb-3 space-y-2">
                                {message.files.map((file, idx) => (
                                  <div key={idx} className="relative">
                                    {file.type === "image" ? (
                                      <div className="relative w-full max-w-md rounded-lg overflow-hidden border border-white/20">
                                        <Image
                                          src={file.url}
                                          alt={file.name}
                                          width={400}
                                          height={300}
                                          className="w-full h-auto"
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                                        <Mic className="h-4 w-4" />
                                        <span className="text-sm">
                                          {file.name}
                                        </span>
                                        <audio controls className="flex-1">
                                          <source src={file.url} />
                                        </audio>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {message.content && (
                              <p className="text-sm whitespace-pre-wrap">
                                {message.content}
                              </p>
                            )}
                          </>
                        )}
                        <div
                          className={cn(
                            "flex items-center gap-2 mt-2 pt-2 border-t",
                            message.role === "user"
                              ? "border-white/20"
                              : "border-gray-200 dark:border-zinc-700",
                          )}
                        >
                          <span
                            className={cn(
                              "text-xs",
                              message.role === "user"
                                ? "text-white/70"
                                : "text-gray-500 dark:text-gray-400",
                            )}
                          >
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                              message.role === "user"
                                ? "text-white/70 hover:text-white hover:bg-white/20"
                                : "text-gray-500 hover:text-gray-900 dark:hover:text-white",
                            )}
                            onClick={() =>
                              handleCopy(message.content, message.id)
                            }
                          >
                            {copiedId === message.id ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {message.role === "user" && (
                        <div className="flex items-start">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 shrink-0">
                        <Bot className="h-4 w-4 text-violet-500" />
                      </div>
                      <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-zinc-800 shrink-0">
            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative flex items-center gap-2 p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg"
                  >
                    {file.type.startsWith("image/") ? (
                      <div className="relative w-16 h-16 rounded overflow-hidden">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <Mic className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-xs max-w-[100px] truncate">
                      {file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {/* File Upload Button */}
              {canAttachFiles && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={
                      modelSupportsImage && modelSupportsAudio
                        ? "image/*,audio/*"
                        : modelSupportsImage
                          ? "image/*"
                          : "audio/*"
                    }
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-[44px] w-[44px]"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={
                      isLoading || isUploadingFiles || !currentSessionId
                    }
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </>
              )}

              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  textModels.length === 0
                    ? "Configure AI models first..."
                    : !currentSessionId
                      ? "Start a new chat to begin..."
                      : canAttachFiles
                        ? "Type your message or attach files..."
                        : "Type your message..."
                }
                className="min-h-[44px] max-h-[200px] resize-none flex-1"
                rows={1}
                disabled={
                  !selectedModel ||
                  isLoading ||
                  isUploadingFiles ||
                  textModels.length === 0 ||
                  !currentSessionId
                }
              />

              {/* Stop Button */}
              {isLoading && (
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-[44px] w-[44px]"
                  onClick={handleStop}
                >
                  <Square className="h-4 w-4" />
                </Button>
              )}

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={
                  (!input.trim() && attachedFiles.length === 0) ||
                  !selectedModel ||
                  isLoading ||
                  isUploadingFiles ||
                  !currentSessionId
                }
                className="shrink-0 h-[44px] w-[44px]"
                size="icon"
              >
                {isUploadingFiles ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
