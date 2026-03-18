// ============================================
// RBAC Types
// ============================================

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission: Permission;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: RolePermission[];
  createdAt: string;
  updatedAt: string;
}
