"use client";

import { useState, useEffect, useCallback, useMemo, useId } from "react";
import {
  Ticket as TicketIcon,
  MessageCircle,
  Plus,
  Send,
  X,
  Filter,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/shadcn-ui/avatar";
import { Badge } from "@repo/shadcn-ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { Button } from "@repo/shadcn-ui/button";
import { Input } from "@repo/shadcn-ui/input";
import { Label } from "@repo/shadcn-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/shadcn-ui/dialog";
import { Textarea } from "@repo/shadcn-ui/textarea";
import { DataTable, type Column } from "@/components/data-table";
import { ticketService, type Ticket as TicketType } from "@/services";
import type { TicketStats } from "@/services/server";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageHeader } from "@/components/panel/page-header";
import { formatDistanceToNow, getInitials } from "./utils";
import { statusConfig, StatusBadge } from "./atoms/status-badge";
import { priorityConfig } from "./atoms/priority-badge";
import { StatsGrid, type StatItem } from "@/components/stats";
import { Ticket, AlertCircle, Clock, CheckCircle } from "lucide-react";

interface TicketsPageClientProps {
  initialTickets: TicketType[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
  initialStats: TicketStats | null;
}

export function TicketsPageClient({
  initialTickets,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
  initialStats,
}: TicketsPageClientProps) {
  const [tickets, setTickets] = useState<TicketType[]>(initialTickets);
  const [stats, setStats] = useState<TicketStats | null>(initialStats);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "open" | "in_progress" | "closed" | "all"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "low" | "medium" | "high" | "all"
  >("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);

  // Dialogs
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  // Form states
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketDescription, setNewTicketDescription] = useState("");
  const [newTicketPriority, setNewTicketPriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [newMessage, setNewMessage] = useState("");

  // Unique IDs for form fields
  const subjectId = useId();
  const priorityId = useId();
  const descriptionId = useId();
  const newMessageId = useId();

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ticketService.getTickets({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
      });

      if (response.success && response.data) {
        setTickets(response.data.data || []);
        setTotal(response.data.meta.total);
        setTotalPages(response.data.meta.totalPages);
      }
    } catch (error) {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, priorityFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await ticketService.getTicketStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      // Silent fail for stats
    }
  }, []);

  const loadTicketDetail = useCallback(async (ticketId: string) => {
    try {
      const response = await ticketService.getTicketById(ticketId);
      if (response.success && response.data) {
        setSelectedTicket(response.data);
        setShowTicketDetail(true);
      }
    } catch (error) {
      toast.error("Failed to load ticket details");
    }
  }, []);

  // Update tickets when initial props change
  useEffect(() => {
    setTickets(initialTickets);
    setTotal(initialTotal);
    setTotalPages(initialTotalPages);
    setStats(initialStats);
  }, [initialTickets, initialTotal, initialTotalPages, initialStats]);

  // Load tickets when filters or pagination changes
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketDescription) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await ticketService.createTicket({
        subject: newTicketSubject,
        description: newTicketDescription,
        priority: newTicketPriority,
      });

      if (response.success) {
        toast.success("Ticket created successfully");
        setShowNewTicket(false);
        setNewTicketSubject("");
        setNewTicketDescription("");
        setNewTicketPriority("medium");
        await loadTickets();
        await loadStats();
      } else {
        toast.error(response.message || "Failed to create ticket");
      }
    } catch (error) {
      toast.error("Failed to create ticket");
    }
  };

  const handleAddMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) {
      return;
    }

    try {
      const response = await ticketService.addTicketMessage(selectedTicket.id, {
        content: newMessage,
      });

      if (response.success) {
        setNewMessage("");
        await loadTicketDetail(selectedTicket.id);
        await loadTickets();
      } else {
        toast.error(response.message || "Failed to add message");
      }
    } catch (error) {
      toast.error("Failed to add message");
    }
  };

  const columns: Column<TicketType>[] = useMemo(
    () => [
      {
        key: "ticket",
        header: "Ticket",
        sortable: false,
        cell: (ticket) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-500 text-white font-semibold text-xs">
              <TicketIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-white">
                {ticket.subject}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {ticket.id}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "user",
        header: "User",
        sortable: false,
        cell: (ticket) => (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={ticket.user.image || undefined} />
              <AvatarFallback>
                {getInitials(ticket.user.name || ticket.user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {ticket.user.name || ticket.user.email}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {ticket.user.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: false,
        cell: (ticket) => <StatusBadge status={ticket.status} />,
      },
      {
        key: "priority",
        header: "Priority",
        sortable: false,
        cell: (ticket) => {
          const config = priorityConfig[ticket.priority];
          return (
            <Badge variant="outline" className={cn("border", config.className)}>
              {config.label}
            </Badge>
          );
        },
      },
      {
        key: "messages",
        header: "Messages",
        sortable: false,
        cell: (ticket) => (
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {ticket._count.messages}
            </span>
          </div>
        ),
      },
      {
        key: "created",
        header: "Created",
        sortable: false,
        cell: (ticket) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatDistanceToNow(new Date(ticket.createdAt), {
              addSuffix: true,
            })}
          </span>
        ),
      },
    ],
    [],
  );

  const actions = useMemo(
    () => [
      {
        label: "View Details",
        icon: <MessageCircle className="h-4 w-4" />,
        onClick: (ticket: TicketType) => {
          loadTicketDetail(ticket.id);
        },
      },
    ],
    [loadTicketDetail],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        icon={TicketIcon}
        title="Support Tickets"
        description="Manage and track your support requests"
        titleSize="large"
        actions={[
          {
            label: "New Ticket",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setShowNewTicket(true),
            className: "bg-blue-600 hover:bg-blue-700 text-white",
          },
        ]}
      />

      {stats && (
        <StatsGrid
          items={
            [
              {
                label: "Total Tickets",
                value: stats.total,
                icon: Ticket,
                color: "blue",
                trend: "+12%",
              },
              {
                label: "Open",
                value: stats.open,
                icon: AlertCircle,
                color: "amber",
                trend: "+5%",
              },
              {
                label: "In Progress",
                value: stats.inProgress,
                icon: Clock,
                color: "orange",
                trend: "+8%",
              },
              {
                label: "Resolved",
                value: stats.closed,
                icon: CheckCircle,
                color: "emerald",
                trend: "+15%",
              },
            ] satisfies StatItem[]
          }
        />
      )}

      {/* Tickets Table */}
      <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>
            {total} ticket{total === 1 ? "" : "s"} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={tickets}
            columns={columns}
            actions={actions}
            loading={loading}
            loadingText="Loading tickets..."
            emptyIcon={<TicketIcon className="h-8 w-8 text-gray-400" />}
            emptyTitle="No tickets found"
            emptyDescription="Create your first support ticket to get started"
            searchable
            searchPlaceholder="Search by subject or ID..."
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
            getRowId={(ticket) => ticket.id}
            onRefresh={loadTickets}
          />
        </CardContent>
      </Card>

      {/* New Ticket Dialog */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>
              Describe your issue and we'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTicket}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor={subjectId}>Subject</Label>
                <Input
                  id={subjectId}
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={priorityId}>Priority</Label>
                <Select
                  value={newTicketPriority}
                  onValueChange={(value: any) => setNewTicketPriority(value)}
                >
                  <SelectTrigger id={priorityId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={descriptionId}>Description</Label>
                <Textarea
                  id={descriptionId}
                  value={newTicketDescription}
                  onChange={(e) => setNewTicketDescription(e.target.value)}
                  placeholder="Provide detailed information about your issue..."
                  rows={6}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewTicket(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Ticket</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Dialog */}
      <Dialog open={showTicketDetail} onOpenChange={setShowTicketDetail}>
        <DialogContent className="sm:max-w-3xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle>{selectedTicket.subject}</DialogTitle>
                    <div className="mt-2 flex items-center gap-4 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          statusConfig[
                            selectedTicket.status as keyof typeof statusConfig
                          ]?.className || statusConfig.open.className,
                        )}
                      >
                        {statusConfig[
                          selectedTicket.status as keyof typeof statusConfig
                        ]?.label || statusConfig.open.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          priorityConfig[
                            selectedTicket.priority as keyof typeof priorityConfig
                          ]?.className || priorityConfig.medium.className,
                        )}
                      >
                        {priorityConfig[
                          selectedTicket.priority as keyof typeof priorityConfig
                        ]?.label || priorityConfig.medium.label}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Created{" "}
                        {formatDistanceToNow(
                          new Date(selectedTicket.createdAt),
                          { addSuffix: true },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Initial Description */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Description
                  </h3>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Messages ({selectedTicket.messages?.length || 0})
                  </h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {(selectedTicket.messages || []).map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.isInternal &&
                            "opacity-60 border-l-2 border-l-amber-500 pl-3",
                        )}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.user.image || undefined} />
                          <AvatarFallback>
                            {getInitials(
                              message.user.name || message.user.email,
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {message.user.name || message.user.email}
                            </span>
                            {message.isInternal && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                              >
                                Internal
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(
                                new Date(message.createdAt),
                                {
                                  addSuffix: true,
                                },
                              )}
                            </span>
                          </div>
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Message */}
                {selectedTicket.status !== "closed" && (
                  <div className="space-y-2">
                    <Label htmlFor={newMessageId}>Add a message</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id={newMessageId}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows={3}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAddMessage}
                        disabled={!newMessage.trim()}
                        className="self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
