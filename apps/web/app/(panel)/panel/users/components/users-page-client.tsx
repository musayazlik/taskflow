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
  Mail,
  Calendar,
  Sparkles,
  KeyRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/shadcn-ui/avatar";
import { ImageZoom } from "@repo/shadcn-ui/image-zoom";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/shadcn-ui/card";

import { userService } from "@/services";
import type { UserFrontend as User } from "@repo/types";
import { RoleBadge, StatusBadge } from "./badges";
import {
  DataTable,
  type Column,
  type DataTableAction,
  type BulkAction,
} from "@/components/data-table";

import { toast } from "sonner";
import { PageHeader } from "@/components/panel/page-header";
import { StatItem, StatsGrid } from "@/components/stats";
import {
  UserCreateDialog,
} from "./dialogs/user-create-dialog";
import { UserEditDialog } from "./dialogs/user-edit-dialog";
import { UserDeleteDialog } from "./dialogs/user-delete-dialog";
import type { UserCreateInput, AdminUserEditInput } from "@repo/validations/user";

interface UsersPageClientProps {
  initialUsers: User[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);

  // ========== Create Dialog State ==========
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // ========== Edit Dialog State ==========
  const [isEditOpen, setIsEditOpen] = useState(false);

  // ========== Delete Dialog State ==========
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

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

  // ========== Create User Handlers ==========
  const handleCreateUser = useCallback(
    async (values: UserCreateInput) => {
      try {
        const response = await userService.createUser(values);
        if (response.success) {
          toast.success(response.message || "User created successfully");
          await loadUsers();
          return { success: true as const, message: response.message };
        }
        return {
          success: false as const,
          message: response.message || "Failed to create user",
        };
      } catch {
        return { success: false as const, message: "An unexpected error occurred" };
      }
    },
    [loadUsers],
  );

  // ========== Edit User Handlers ==========
  const openEditDialog = useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  }, []);

  const editDefaultValues = useMemo(() => {
    if (!selectedUser) return null;
    // Map SUPER_ADMIN to ADMIN since edit dialog only supports USER and ADMIN
    const mappedRole = selectedUser.role === "SUPER_ADMIN" ? "ADMIN" : selectedUser.role;
    return {
      name: selectedUser.name,
      email: selectedUser.email,
      role: mappedRole as "USER" | "ADMIN",
    };
  }, [selectedUser]);

  const handleEditUser = useCallback(
    async (values: AdminUserEditInput) => {
      if (!selectedUser) {
        return { success: false as const, message: "No user selected" };
      }
      try {
        const response = await userService.updateUser(selectedUser.id, values);
        if (response.success) {
          toast.success(response.message || "User updated successfully");
          await loadUsers();
          return { success: true as const, message: response.message };
        }
        return {
          success: false as const,
          message: response.message || "Failed to update user",
        };
      } catch {
        return { success: false as const, message: "An unexpected error occurred" };
      }
    },
    [selectedUser, loadUsers],
  );

  // ========== Delete User Handlers ==========
  const openDeleteDialog = useCallback((user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  }, []);

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser) return;

    try {
      setDeleteSubmitting(true);
      const response = await userService.deleteUser(selectedUser.id);

      if (response.success) {
        setIsDeleteOpen(false);
        toast.success("User deleted successfully");
        await loadUsers();
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch {
      toast.error("An unexpected error occurred during deletion");
    } finally {
      setDeleteSubmitting(false);
    }
  }, [selectedUser, loadUsers]);

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
            onClick: () => setIsCreateOpen(true),
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

      {/* Dialogs - Parent-controlled pattern */}
      <UserCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateUser}
      />

      <UserEditDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        defaultValues={editDefaultValues}
        onSubmit={handleEditUser}
      />

      <UserDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        userName={selectedUser?.name || ""}
        onConfirm={handleDeleteUser}
        submitting={deleteSubmitting}
      />
    </div>
  );
}
