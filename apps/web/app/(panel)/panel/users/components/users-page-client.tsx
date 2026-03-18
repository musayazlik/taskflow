"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Users,
  Crown,
  Shield,
  Mail,
  Calendar,
  Sparkles,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/shadcn-ui/avatar";
import { ImageZoom } from "@repo/shadcn-ui/image-zoom";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/shadcn-ui/card";
import { Badge } from "@repo/shadcn-ui/badge";
import { userService, type User } from "@/services";
import {
  DataTable,
  type Column,
  type DataTableAction,
  type BulkAction,
} from "@/components/data-table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageHeader } from "@/components/panel/page-header";
import { StatItem, StatsGrid } from "@/components/stats";
import { CreateUserDialog } from "./dialogs/create-user-dialog";
import { EditUserDialog } from "./dialogs/edit-user-dialog";
import { DeleteUserDialog } from "./dialogs/delete-user-dialog";

interface UsersPageClientProps {
  initialUsers: User[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
}

// Role badge component
function RoleBadge({ role }: { role: string }) {
  const defaultConfig = {
    icon: Shield,
    label: "User",
    className:
      "bg-gray-100 dark:bg-zinc-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-600",
  };

  const config: Record<
    string,
    { icon: typeof Crown; label: string; className: string }
  > = {
    SUPER_ADMIN: {
      icon: ShieldCheck,
      label: "Super Admin",
      className:
        "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
    },
    ADMIN: {
      icon: Crown,
      label: "Admin",
      className:
        "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
    },
    USER: defaultConfig,
  };

  const roleConfig = config[role] ?? defaultConfig;
  const Icon = roleConfig.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
        roleConfig.className,
      )}
    >
      <Icon className="h-3 w-3" />
      {roleConfig.label}
    </span>
  );
}

// Status badge component
function StatusBadge({
  verified,
  verifiedAt,
}: {
  verified: boolean;
  verifiedAt?: string | null;
}) {
  if (verified) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
          <UserCheck className="h-3 w-3" />
          Verified
        </span>
        {verifiedAt && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
            {new Date(verifiedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
      <UserX className="h-3 w-3" />
      Pending
    </span>
  );
}

export function UsersPageClient({
  initialUsers,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
}: UsersPageClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRows, setSelectedRows] = useState<User[]>([]);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers({
        page: currentPage,
        limit: pageSize,
      });

      if (response.success && response.data) {
        setUsers(response.data?.data || []);
        setTotalPages(response.data.meta.totalPages);
        setTotal(response.data.meta.total);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  const handleSendPasswordReset = async (user: User) => {
    try {
      const response = await userService.sendPasswordReset(user.id);
      if (response.success) {
        toast.success(`Password reset email sent to ${user.email}`);
      } else {
        toast.error(response.message || "Failed to send password reset email");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  };

  const handleVerifyEmail = async (user: User) => {
    try {
      const response = await userService.verifyEmail(user.id);
      if (response.success) {
        toast.success(`Email verified for ${user.name}`);
        await loadUsers();
      } else {
        toast.error(response.message || "Failed to verify email");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  };

  const handleUnverifyEmail = async (user: User) => {
    try {
      const response = await userService.unverifyEmail(user.id);
      if (response.success) {
        toast.success(`Email unverified for ${user.name}`);
        await loadUsers();
      } else {
        toast.error(response.message || "Failed to unverify email");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  };

  const openEditDialog = useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  }, []);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term),
    );
  }, [users, searchTerm]);

  // Stats calculations
  const { totalUsers, adminUsers, regularUsers, verifiedUsers } =
    useMemo(() => {
      const totalUsers = total;
      const adminUsers = users.filter(
        (u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN",
      ).length;
      const regularUsers = users.filter((u) => u.role === "USER").length;
      const verifiedUsers = users.filter((u) => u.emailVerified).length;

      return {
        totalUsers,
        adminUsers,
        regularUsers,
        verifiedUsers,
      };
    }, [users, total]);

  // Table columns
  const columns: Column<User>[] = useMemo(
    () => [
      {
        key: "name",
        header: "User",
        sortable: true,
        cell: (user) => (
          <div className="flex items-center gap-3">
            {user.image ? (
              <ImageZoom>
                <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm cursor-zoom-in">
                  <AvatarImage
                    src={user.image}
                    alt={user.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-white text-sm font-semibold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </ImageZoom>
            ) : (
              <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm">
                <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-white text-sm font-semibold">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-white">
                {user.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        sortable: true,
        cell: (user) => <RoleBadge role={user.role} />,
      },
      {
        key: "status",
        header: "Status",
        cell: (user) => (
          <StatusBadge
            verified={user.emailVerified}
            verifiedAt={user.emailVerifiedAt}
          />
        ),
      },
      {
        key: "createdAt",
        header: "Joined",
        sortable: true,
        cell: (user) => (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        ),
      },
    ],
    [],
  );

  // Table actions
  const actions: DataTableAction<User>[] = [
    {
      label: "Edit User",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (user: User) => openEditDialog(user),
    },
    {
      label: "Send Password Reset",
      icon: <KeyRound className="h-4 w-4" />,
      onClick: (user: User) => handleSendPasswordReset(user),
    },
    {
      label: (user: User) =>
        user.emailVerified ? "Unverify Email" : "Verify Email",
      icon: <UserCheck className="h-4 w-4" />,
      onClick: (user: User) =>
        user.emailVerified
          ? handleUnverifyEmail(user)
          : handleVerifyEmail(user),
    },
    {
      label: "Delete User",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (user: User) => openDeleteDialog(user),
      variant: "destructive",
    },
  ];

  // Bulk actions
  const handleBulkDelete = async (users: User[]) => {
    if (
      !confirm(
        `Are you sure you want to delete ${users.length} users? This action cannot be undone.`,
      )
    ) {
      return;
    }

    const ids = users.map((u) => u.id);
    const response = await userService.bulkDelete(ids);

    if (response.success) {
      toast.success(response.message);
      setSelectedRows([]);
      await loadUsers();
    } else {
      toast.error(response.message || "Failed to delete users");
    }
  };

  const handleBulkVerify = async (users: User[]) => {
    const ids = users.map((u) => u.id);
    const response = await userService.bulkVerify(ids);

    if (response.success) {
      toast.success(response.message);
      setSelectedRows([]);
      await loadUsers();
    } else {
      toast.error(response.message || "Failed to verify users");
    }
  };

  const handleBulkUnverify = async (users: User[]) => {
    const ids = users.map((u) => u.id);
    const response = await userService.bulkUnverify(ids);

    if (response.success) {
      toast.success(response.message);
      setSelectedRows([]);
      await loadUsers();
    } else {
      toast.error(response.message || "Failed to deactivate users");
    }
  };

  const bulkActions: BulkAction<User>[] = [
    {
      label: "Verify All",
      icon: <UserCheck className="h-4 w-4" />,
      onClick: handleBulkVerify,
      variant: "default",
    },
    {
      label: "Deactivate All",
      icon: <UserX className="h-4 w-4" />,
      onClick: handleBulkUnverify,
      variant: "warning",
    },
    {
      label: "Delete All",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
    },
  ];

  const statsItems = useMemo<StatItem[]>(() => {
    return [
      {
        label: "Total Users",
        value: totalUsers,
        icon: Users,
        color: "amber",
      },
      {
        label: "Admin Users",
        value: adminUsers,
        icon: Crown,
        color: "cyan",
      },
      {
        label: "Regular Users",
        value: regularUsers,
        icon: Users,
        color: "pink",
      },
      {
        label: "Verified Users",
        value: verifiedUsers,
        icon: UserCheck,
        color: "green",
      },
    ];
  }, [totalUsers, adminUsers, regularUsers, verifiedUsers]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Users"
        description="Manage user accounts and permissions"
        badge={{
          icon: <Sparkles className="h-4 w-4" />,
          label: `${total} total users`,
        }}
        actions={[
          {
            label: "Add User",
            icon: <Plus className="w-4 h-4" />,
            onClick: () => setIsCreateDialogOpen(true),
            className: "shadow-lg shadow-primary/25",
          },
        ]}
      />

      <StatsGrid items={statsItems} />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredUsers}
            columns={columns}
            actions={actions}
            bulkActions={bulkActions}
            loading={loading}
            loadingText="Loading users..."
            emptyIcon={<Users className="h-8 w-8 text-gray-400" />}
            emptyTitle="No users found"
            emptyDescription="Get started by adding your first user."
            searchable
            searchPlaceholder="Search by name or email..."
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
            getRowId={(user) => user.id}
            onRefresh={loadUsers}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={loadUsers}
      />

      <EditUserDialog
        user={selectedUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={loadUsers}
      />

      <DeleteUserDialog
        user={selectedUser}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={loadUsers}
      />
    </div>
  );
}
