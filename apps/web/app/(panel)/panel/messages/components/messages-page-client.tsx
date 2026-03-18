"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Mail,
  Calendar,
  Eye,
  Trash2,
  Archive,
  Star,
  Inbox,
  Send,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/shadcn-ui/dialog";
import { Badge } from "@repo/shadcn-ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/shadcn-ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import {
  DataTable,
  type Column,
  type DataTableAction,
  type BulkAction,
} from "@/components/data-table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  PANEL_INBOX_MESSAGES,
  PANEL_SENT_MESSAGES,
  PANEL_DRAFT_MESSAGES,
} from "@repo/types";
import { PageHeader } from "@/components/panel/page-header";
import { StatsGrid, type StatItem } from "@/components/stats";

// Message type
type Message = {
  id: string | number;
  from?: string;
  fromName?: string;
  to?: string;
  toName?: string;
  subject: string;
  preview: string;
  content?: string;
  date: string;
  read?: boolean;
  starred?: boolean;
  category?: string;
  status?: string;
};

// Category badge colors
const categoryColors: Record<string, string> = {
  support: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  feedback:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inquiry:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  billing:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  general: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  feature:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  system: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  business:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export function MessagesPageClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Message[]>([]);
  const [starredMessages, setStarredMessages] = useState<Set<string | number>>(
    new Set(),
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Calculate stats
  const stats = useMemo(() => {
    const allInbox = PANEL_INBOX_MESSAGES;
    const allSent = PANEL_SENT_MESSAGES;
    const allDrafts = PANEL_DRAFT_MESSAGES;

    const unreadCount = allInbox.filter((m) => !m.read).length;
    const starredCount = starredMessages.size;

    return {
      inbox: allInbox.length,
      unread: unreadCount,
      sent: allSent.length,
      drafts: allDrafts.length,
      starred: starredCount,
    };
  }, [starredMessages]);

  // Load messages from mock data
  const loadMessages = useCallback(() => {
    setLoading(true);
    try {
      // Combine all messages
      const inboxMessages: Message[] = PANEL_INBOX_MESSAGES.map((msg) => ({
        ...msg,
        id: String(msg.id),
        content:
          msg.preview +
          "\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      }));

      const sentMessages: Message[] = PANEL_SENT_MESSAGES.map((msg) => ({
        ...msg,
        id: `sent-${msg.id}`,
        from: msg.to,
        fromName: msg.toName,
        read: true,
        starred: false,
        category: msg.status,
        content:
          msg.preview +
          "\n\nThank you for your message. We have received your inquiry and will get back to you soon.",
      }));

      const draftMessages: Message[] = PANEL_DRAFT_MESSAGES.map((msg) => ({
        ...msg,
        id: `draft-${msg.id}`,
        from: msg.to,
        fromName: msg.toName,
        read: true,
        starred: false,
        category: "draft",
        content:
          msg.preview +
          "\n\nThis is a draft message that has not been sent yet.",
      }));

      const allMessages = [...inboxMessages, ...sentMessages, ...draftMessages];

      // Pagination
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedMessages = allMessages.slice(startIndex, endIndex);

      setMessages(paginatedMessages);
      setTotal(allMessages.length);
      setTotalPages(Math.ceil(allMessages.length / pageSize));
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("An error occurred while loading messages");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Toggle star
  const toggleStar = useCallback((message: Message) => {
    setStarredMessages((prev) => {
      const newSet = new Set(prev);
      const isStarred = newSet.has(message.id);
      if (isStarred) {
        newSet.delete(message.id);
        toast.success("Star removed");
      } else {
        newSet.add(message.id);
        toast.success("Star added");
      }
      return newSet;
    });
  }, []);

  // Open view dialog
  const openViewDialog = useCallback((message: Message) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
  }, []);

  // Filter messages based on search
  const filteredMessages = useMemo(() => {
    if (!searchTerm) return messages;
    const term = searchTerm.toLowerCase();
    return messages.filter(
      (message) =>
        message.subject.toLowerCase().includes(term) ||
        message.fromName?.toLowerCase().includes(term) ||
        message.from?.toLowerCase().includes(term) ||
        message.preview.toLowerCase().includes(term),
    );
  }, [messages, searchTerm]);

  // Table columns
  const columns: Column<Message>[] = useMemo(
    () => [
      {
        key: "from",
        header: "Sender",
        sortable: true,
        cell: (message) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.fromName || message.from}`}
                alt={message.fromName || message.from}
              />
              <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                {getInitials(message.fromName || message.from || "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-white">
                {message.fromName || message.from}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {message.from || message.to}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "subject",
        header: "Subject",
        sortable: true,
        cell: (message) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {!message.read && (
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              )}
              <span
                className={cn(
                  "font-medium",
                  !message.read
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-700 dark:text-gray-300",
                )}
              >
                {message.subject}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
              {message.preview}
            </p>
          </div>
        ),
      },
      {
        key: "category",
        header: "Category",
        cell: (message) =>
          message.category ? (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                categoryColors[message.category] || categoryColors.general,
              )}
            >
              {message.category}
            </Badge>
          ) : (
            <span className="text-gray-400">-</span>
          ),
      },
      {
        key: "date",
        header: "Date",
        sortable: true,
        cell: (message) => (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            {message.date}
          </div>
        ),
      },
    ],
    [],
  );

  // Table actions
  const actions: DataTableAction<Message>[] = useMemo(
    () => [
      {
        label: "View Message",
        icon: <Eye className="h-4 w-4" />,
        onClick: (message: Message) => openViewDialog(message),
      },
      {
        label: (message: Message) =>
          starredMessages.has(message.id) ? "Remove Star" : "Star",
        icon: <Star className="h-4 w-4" />,
        onClick: (message: Message) => toggleStar(message),
      },
      {
        label: "Archive",
        icon: <Archive className="h-4 w-4" />,
        onClick: (message: Message) => {
          toast.success("Message archived");
        },
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (message: Message) => {
          if (confirm("Are you sure you want to delete this message?")) {
            toast.success("Message deleted");
            loadMessages();
          }
        },
        variant: "destructive",
      },
    ],
    [openViewDialog, toggleStar, starredMessages, loadMessages],
  );

  // Bulk actions
  const handleBulkDelete = async (messages: Message[]) => {
    if (
      !confirm(`Are you sure you want to delete ${messages.length} messages?`)
    ) {
      return;
    }
    toast.success(`${messages.length} messages deleted`);
    setSelectedRows([]);
    await loadMessages();
  };

  const handleBulkArchive = async (messages: Message[]) => {
    toast.success(`${messages.length} messages archived`);
    setSelectedRows([]);
    await loadMessages();
  };

  const bulkActions: BulkAction<Message>[] = useMemo(
    () => [
      {
        label: "Archive",
        icon: <Archive className="h-4 w-4" />,
        onClick: handleBulkArchive,
        variant: "default",
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: handleBulkDelete,
        variant: "destructive",
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Mail}
        title="Messages"
        description="View and manage your messages"
      />

      {/* Stats Grid */}
      <StatsGrid
        items={
          [
            {
              label: "Total Messages",
              value: messages.length,
              icon: Mail,
              color: "blue",
              trend: "+12%",
            },

            {
              label: "Sent",
              value: stats.sent,
              icon: Send,
              color: "green",
              trend: "+18%",
            },
            {
              label: "Drafts",
              value: stats.drafts,
              icon: Archive,
              color: "emerald",
              trend: "+8%",
            },
            {
              label: "Starred",
              value: stats.starred,
              icon: Star,
              color: "violet",
              trend: "+5%",
            },
          ] as StatItem[]
        }
        columns={{ default: 1, sm: 2, lg: 4 }}
        showTrends
      />

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            {total} message{total === 1 ? "" : "s"} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredMessages}
            columns={columns}
            actions={actions}
            bulkActions={bulkActions}
            loading={loading}
            loadingText="Loading messages..."
            emptyIcon={<Mail className="h-8 w-8 text-gray-400" />}
            emptyTitle="No messages found"
            emptyDescription="You don't have any messages yet."
            searchable
            searchPlaceholder="Search by subject, sender or content..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            selectable
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            getRowId={(message) => String(message.id)}
            onRefresh={loadMessages}
          />
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedMessage?.fromName || selectedMessage?.from}`}
                  alt={selectedMessage?.fromName || selectedMessage?.from}
                />
                <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 text-white">
                  {selectedMessage?.fromName
                    ? getInitials(selectedMessage.fromName)
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-gray-900 dark:text-white truncate">
                  {selectedMessage?.subject}
                </DialogTitle>
                {selectedMessage?.fromName && (
                  <DialogDescription className="text-gray-500 dark:text-gray-400 mt-1">
                    <span className="font-medium">
                      {selectedMessage.fromName}
                    </span>
                    <span className="text-xs ml-1">
                      ({selectedMessage.from})
                    </span>
                  </DialogDescription>
                )}
              </div>
              {selectedMessage?.category && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    categoryColors[selectedMessage.category] ||
                      categoryColors.general,
                  )}
                >
                  {selectedMessage.category}
                </Badge>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-zinc-800">
              <Calendar className="h-4 w-4" />
              <span>{selectedMessage?.date}</span>
            </div>

            {/* Message Content */}
            <div className="prose dark:prose-invert max-w-none">
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {selectedMessage?.content ||
                  selectedMessage?.preview ||
                  "Message content not found."}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
