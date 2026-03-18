import { apiClient } from "@/lib/api";
import type { Permission } from "@repo/types";
import type { Role } from "@repo/types/rbac";

export const rbacService = {
  async getPermissions(): Promise<Permission[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: Permission[];
    }>("/api/rbac/permissions");
    return response.data;
  },

  async createPermission(data: {
    name: string;
    description?: string;
  }): Promise<Permission> {
    const response = await apiClient.post<{
      success: boolean;
      data: Permission;
    }>("/api/rbac/permissions", data);
    return response.data;
  },

  async deletePermission(id: string): Promise<void> {
    await apiClient.delete(`/api/rbac/permissions/${id}`);
  },

  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get<{ success: boolean; data: Role[] }>(
      "/api/rbac/roles",
    );
    return response.data;
  },

  async createRole(data: {
    name: string;
    description?: string;
    permissionIds: string[];
  }): Promise<Role> {
    const response = await apiClient.post<{ success: boolean; data: Role }>(
      "/api/rbac/roles",
      data,
    );
    return response.data;
  },

  async updateRolePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const response = await apiClient.patch<{ success: boolean; data: Role }>(
      `/api/rbac/roles/${roleId}`,
      { permissionIds },
    );
    return response.data;
  },

  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/api/rbac/roles/${id}`);
  },
};
