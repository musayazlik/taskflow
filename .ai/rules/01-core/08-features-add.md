# Adding New Features Roadmap

This document describes the step-by-step process to follow when adding a new feature to the TaskFlow project. All features should be developed following this order.

## 🎯 Overview

When adding a new feature, follow this order:

1. **Database Schema** - Add to model structure (if exists, don't modify)
2. **Type Definitions** - Add structure to `@packages/types/`
3. **API Service** - Create service structure in `@apps/api/src/services/`
4. **API Routes** - Add routes in `@apps/api/src/routes/`
5. **Web Service** - Create web service in `@apps/web/services/`
6. **Web Page** - Create page in `@apps/web/app/(panel)/panel/`
7. **Sidebar Integration** - Add menu item to sidebar

---

## 📋 Step 1: Database Schema Check and Update

### Checklist

- [ ] Check existing Prisma schema (`packages/database/prisma/schema.prisma`)
- [ ] Check if required models/fields exist for the new feature
- [ ] **If model exists, don't modify** - Use existing structure
- [ ] **If model doesn't exist**, add new model

### Adding New Model Example

```prisma
// packages/database/prisma/schema.prisma

model NewFeature {
  id        String   @id @default(cuid())
  name      String
  status    String   @default("active")
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("new_features")
}
```

### Running Migration

```bash
cd packages/database
bunx prisma migrate dev --name add_new_feature
bunx prisma generate
```

### ⚠️ Important Notes

- **Don't modify existing models** - If the model you need already exists, use it
- Run migrations in test environment first
- Define relations (`@relation`) correctly
- Add indexes (`@@index`) for performance

---

## 📦 Step 2: Type Definitions (`@packages/types/`)

### File Structure

Create an appropriate type file for each feature or add to existing file:

```
packages/types/src/
├── new-feature.ts          # Types for new feature
├── index.ts                # Add export
```

### Type Definition Example

```typescript
// packages/types/src/new-feature.ts

import { Static, Type as t } from "@sinclair/typebox";

// Schema for TypeBox (backend validation)
export const NewFeatureSchema = t.Object({
  id: t.String(),
  name: t.String(),
  status: t.String(),
  userId: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type NewFeature = Static<typeof NewFeatureSchema>;

// Create schema
export const CreateNewFeatureSchema = t.Object({
  name: t.String({ minLength: 1 }),
  status: t.Optional(t.String()),
});

export type CreateNewFeature = Static<typeof CreateNewFeatureSchema>;

// Update schema
export const UpdateNewFeatureSchema = t.Object({
  name: t.Optional(t.String()),
  status: t.Optional(t.String()),
});

export type UpdateNewFeature = Static<typeof UpdateNewFeatureSchema>;

// Query schema
export const NewFeatureQuerySchema = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  status: t.Optional(t.String()),
});

export type NewFeatureQuery = Static<typeof NewFeatureQuerySchema>;

// Service-level types (for backend services)
export interface NewFeatureListParams {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
}

export interface CreateNewFeatureData {
  name: string;
  status?: string;
}

export interface UpdateNewFeatureData {
  name?: string;
  status?: string;
}

// Frontend-compatible type (string dates)
export interface NewFeatureFrontend {
  id: string;
  name: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Adding Export to Index

```typescript
// packages/types/src/index.ts

export * from "./new-feature";
```

### ⚠️ Important Notes

- **TypeBox Schemas** are used for backend route validation
- **Service-level interfaces** are used in backend services
- **Frontend-compatible types** are used in frontend (string instead of Date)
- All types should be exported from `@repo/types`

---

## 🔧 Step 3: Backend Service (`@apps/api/src/services/`)

### File Creation

```
apps/api/src/services/
├── new-feature.service.ts
└── index.ts                 # Add export
```

### Service Structure Example

```typescript
// apps/api/src/services/new-feature.service.ts

import { prisma } from "@repo/database";
import { AppError } from "@api/lib/errors";
import type {
  NewFeatureListParams,
  CreateNewFeatureData,
  UpdateNewFeatureData,
} from "@repo/types";

/**
 * New Feature Service
 * Business logic for new feature management
 */

/**
 * Get all new features with pagination
 */
export const getAllNewFeatures = async (
  params: NewFeatureListParams = {}
): Promise<{
  data: Array<{
    id: string;
    name: string;
    status: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    user?: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.userId) {
      where.userId = params.userId;
    }

    const [data, total] = await Promise.all([
      prisma.newFeature.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.newFeature.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching new features:", error);
    throw new AppError(
      "NEW_FEATURE_ERROR",
      "Failed to fetch new features",
      500
    );
  }
};

/**
 * Get new feature by ID
 */
export const getNewFeatureById = async (
  id: string
): Promise<{
  id: string;
  name: string;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}> => {
  try {
    const feature = await prisma.newFeature.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!feature) {
      throw new AppError("NOT_FOUND", "New feature not found", 404);
    }

    return feature;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error fetching new feature:", error);
    throw new AppError("NEW_FEATURE_ERROR", "Failed to fetch new feature", 500);
  }
};

/**
 * Create new feature
 */
export const createNewFeature = async (
  data: CreateNewFeatureData,
  userId: string
): Promise<{
  id: string;
  name: string;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}> => {
  try {
    const feature = await prisma.newFeature.create({
      data: {
        name: data.name,
        status: data.status || "active",
        userId,
      },
    });

    return feature;
  } catch (error) {
    console.error("Error creating new feature:", error);
    throw new AppError(
      "NEW_FEATURE_ERROR",
      "Failed to create new feature",
      500
    );
  }
};

/**
 * Update new feature
 */
export const updateNewFeature = async (
  id: string,
  data: UpdateNewFeatureData
): Promise<{
  id: string;
  name: string;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}> => {
  try {
    const feature = await prisma.newFeature.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.status && { status: data.status }),
      },
    });

    return feature;
  } catch (error) {
    console.error("Error updating new feature:", error);
    throw new AppError(
      "NEW_FEATURE_ERROR",
      "Failed to update new feature",
      500
    );
  }
};

/**
 * Delete new feature
 */
export const deleteNewFeature = async (id: string): Promise<void> => {
  try {
    await prisma.newFeature.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting new feature:", error);
    throw new AppError(
      "NEW_FEATURE_ERROR",
      "Failed to delete new feature",
      500
    );
  }
};
```

### Service Export

```typescript
// apps/api/src/services/index.ts

export * from "./new-feature.service";
```

### ⚠️ Important Notes

- **Business logic** should be in the service layer
- **Error handling** should use AppError
- **Type safety** should import from `@repo/types`
- **Pagination** should use standard format
- **Include relations** should be used where needed

---

## 🛣️ Step 4: Backend Routes (`@apps/api/src/routes/`)

### File Creation

```
apps/api/src/routes/
├── new-feature.ts
└── index.ts                 # Add export
```

### Route Structure Example

```typescript
// apps/api/src/routes/new-feature.ts

import { Elysia, t } from "elysia";
import {
  NewFeatureSchema,
  CreateNewFeatureSchema,
  UpdateNewFeatureSchema,
  NewFeatureQuerySchema,
} from "@repo/types";
import {
  getAllNewFeatures,
  getNewFeatureById,
  createNewFeature,
  updateNewFeature,
  deleteNewFeature,
} from "@/services/new-feature.service";
import { isAuthenticated, isAdmin } from "@/lib/auth";

export const newFeatureRoutes = new Elysia({ prefix: "/new-features" })
  // GET /new-features - List all (with pagination)
  .get(
    "/",
    async ({ query, user, set }) => {
      // Auth check
      if (!user) {
        set.status = 401;
        return { success: false, error: "Unauthorized" };
      }

      // Admin check (if needed)
      // if (!isAdmin(user)) {
      //   set.status = 403;
      //   return { success: false, error: "Forbidden" };
      // }

      const page = query.page ? parseInt(query.page) : 1;
      const limit = query.limit ? parseInt(query.limit) : 10;

      const result = await getAllNewFeatures({
        page,
        limit,
        status: query.status,
        userId: query.userId,
      });

      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };
    },
    {
      query: NewFeatureQuerySchema,
      detail: {
        tags: ["New Features"],
        summary: "Get all new features",
      },
    }
  )

  // GET /new-features/:id - Get single
  .get(
    "/:id",
    async ({ params: { id }, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: "Unauthorized" };
      }

      try {
        const feature = await getNewFeatureById(id);
        return { success: true, data: feature };
      } catch (error: any) {
        if (error.statusCode === 404) {
          set.status = 404;
          return { success: false, error: error.message };
        }
        set.status = 500;
        return { success: false, error: "Internal server error" };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["New Features"],
        summary: "Get new feature by ID",
      },
    }
  )

  // POST /new-features - Create
  .post(
    "/",
    async ({ body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: "Unauthorized" };
      }

      try {
        const feature = await createNewFeature(body, user.id);
        set.status = 201;
        return { success: true, data: feature };
      } catch (error: any) {
        set.status = 500;
        return { success: false, error: error.message || "Failed to create" };
      }
    },
    {
      body: CreateNewFeatureSchema,
      detail: {
        tags: ["New Features"],
        summary: "Create new feature",
      },
    }
  )

  // PATCH /new-features/:id - Update
  .patch(
    "/:id",
    async ({ params: { id }, body, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: "Unauthorized" };
      }

      try {
        const feature = await updateNewFeature(id, body);
        return { success: true, data: feature };
      } catch (error: any) {
        if (error.statusCode === 404) {
          set.status = 404;
          return { success: false, error: error.message };
        }
        set.status = 500;
        return { success: false, error: error.message || "Failed to update" };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: UpdateNewFeatureSchema,
      detail: {
        tags: ["New Features"],
        summary: "Update new feature",
      },
    }
  )

  // DELETE /new-features/:id - Delete
  .delete(
    "/:id",
    async ({ params: { id }, user, set }) => {
      if (!user) {
        set.status = 401;
        return { success: false, error: "Unauthorized" };
      }

      // Admin check (if needed)
      // if (!isAdmin(user)) {
      //   set.status = 403;
      //   return { success: false, error: "Forbidden" };
      // }

      try {
        await deleteNewFeature(id);
        return { success: true, message: "New feature deleted" };
      } catch (error: any) {
        if (error.statusCode === 404) {
          set.status = 404;
          return { success: false, error: error.message };
        }
        set.status = 500;
        return { success: false, error: error.message || "Failed to delete" };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["New Features"],
        summary: "Delete new feature",
      },
    }
  );
```

### Route Export and Adding to App

```typescript
// apps/api/src/routes/index.ts

export * from "./new-feature";
```

```typescript
// apps/api/src/index.ts

import { newFeatureRoutes } from "./routes";

const app = new Elysia()
  // ... other routes
  .use(newFeatureRoutes);
// ...
```

### ⚠️ Important Notes

- **Authentication** should be checked in every route
- **Authorization** (admin check) should be added when needed
- **Validation** should use TypeBox schemas
- **Error handling** should use standard format
- **OpenAPI tags** should be added
- **HTTP status codes** should be used correctly

---

## 🎨 Step 5: Web Service (`@apps/web/services/`)

### File Creation

```
apps/web/services/
├── new-feature.service.ts
└── index.ts                 # Add export
```

### Frontend Service Structure Example

```typescript
// apps/web/services/new-feature.service.ts

import { api } from "@/lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  NewFeatureFrontend,
} from "./types";

export const newFeatureService = {
  /**
   * Get all new features
   */
  async getNewFeatures(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  }): Promise<ApiResponse<PaginatedResponse<NewFeatureFrontend>>> {
    try {
      const query: Record<string, string> = {};
      if (params?.page) query.page = params.page.toString();
      if (params?.limit) query.limit = params.limit.toString();
      if (params?.status) query.status = params.status;
      if (params?.userId) query.userId = params.userId;

      const { data, error } = await api.v1!["new-features"].get({
        query,
      });

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to get new features",
        };
      }

      return {
        success: (data as any)?.success ?? false,
        data: (data as any)?.data as NewFeatureFrontend[] | undefined,
        meta: (data as any)?.pagination,
        error: (data as any)?.error,
        message: (data as any)?.message,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to get new features",
      };
    }
  },

  /**
   * Get new feature by ID
   */
  async getNewFeature(id: string): Promise<ApiResponse<NewFeatureFrontend>> {
    try {
      const { data, error } = await api.v1!["new-features"]({ id }).get();

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to get new feature",
        };
      }

      return {
        success: (data as any)?.success ?? false,
        data: (data as any)?.data as NewFeatureFrontend | undefined,
        error: (data as any)?.error,
        message: (data as any)?.message,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to get new feature",
      };
    }
  },

  /**
   * Create new feature
   */
  async createNewFeature(body: {
    name: string;
    status?: string;
  }): Promise<ApiResponse<NewFeatureFrontend>> {
    try {
      const { data, error } = await api.v1!["new-features"].post(body as any);

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to create new feature",
        };
      }

      return {
        success: (data as any)?.success ?? false,
        data: (data as any)?.data as NewFeatureFrontend | undefined,
        error: (data as any)?.error,
        message: (data as any)?.message,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to create new feature",
      };
    }
  },

  /**
   * Update new feature
   */
  async updateNewFeature(
    id: string,
    body: { name?: string; status?: string }
  ): Promise<ApiResponse<NewFeatureFrontend>> {
    try {
      const { data, error } = await api
        .v1!["new-features"]({ id })
        .patch(body as any);

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to update new feature",
        };
      }

      return {
        success: (data as any)?.success ?? false,
        data: (data as any)?.data as NewFeatureFrontend | undefined,
        error: (data as any)?.error,
        message: (data as any)?.message,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to update new feature",
      };
    }
  },

  /**
   * Delete new feature
   */
  async deleteNewFeature(id: string): Promise<ApiResponse<void>> {
    try {
      const { data, error } = await api.v1!["new-features"]({ id }).delete();

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to delete new feature",
        };
      }

      return {
        success: (data as any)?.success ?? false,
        error: (data as any)?.error,
        message: (data as any)?.message,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to delete new feature",
      };
    }
  },
};
```

### Service Export

```typescript
// apps/web/services/index.ts

export * from "./new-feature.service";
```

### ⚠️ Important Notes

- **API client** should use Eden Treaty
- **Error handling** should use standard format
- **Type safety** should import from `@repo/types`
- **Response parsing** should be done correctly

---

## 📄 Step 6: Web Page (`@apps/web/app/(panel)/panel/`)

### File Creation

```
apps/web/app/(panel)/panel/
└── new-features/
    ├── page.tsx              # List page
    └── [id]/
        └── page.tsx           # Detail page (optional)
```

### Page Structure Example

```typescript
// apps/web/app/(panel)/panel/new-features/page.tsx

"use client";

import { useState, useEffect } from "react";
import { newFeatureService } from "@/services";
import type { NewFeatureFrontend } from "@/services/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function NewFeaturesPage() {
  const [features, setFeatures] = useState<NewFeatureFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const response = await newFeatureService.getNewFeatures({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response.success && response.data && response.meta) {
        setFeatures(response.data);
        setPagination(response.meta);
      } else {
        toast.error(response.message || "Failed to load features");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [pagination.page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feature?")) {
      return;
    }

    try {
      const response = await newFeatureService.deleteNewFeature(id);
      if (response.success) {
        toast.success("Feature deleted successfully");
        fetchFeatures();
      } else {
        toast.error(response.message || "Failed to delete");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Features</h1>
          <p className="text-muted-foreground">
            Manage and view all new features
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchFeatures}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/panel/new-features/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No features found
                </TableCell>
              </TableRow>
            ) : (
              features.map((feature) => (
                <TableRow key={feature.id}>
                  <TableCell className="font-medium">{feature.name}</TableCell>
                  <TableCell>
                    <Badge variant={feature.status === "active" ? "default" : "secondary"}>
                      {feature.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{feature.userId}</TableCell>
                  <TableCell>
                    {format(new Date(feature.createdAt), "PPpp")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/panel/new-features/${feature.id}`}>
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(feature.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page - 1 })
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page + 1 })
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### ⚠️ Important Notes

- **Client Component** (`"use client"`) should be used
- **Loading states** should be displayed
- **Error handling** should use toast
- **Pagination** should be implemented
- **Table component** should use shadcn/ui
- **Date formatting** should use date-fns

---

## 🧭 Step 7: Sidebar Integration

### Sidebar File

```
apps/web/components/panel/
└── sidebar.tsx
```

### Adding to Sidebar Example

```typescript
// apps/web/components/panel/sidebar.tsx

import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  // ... existing imports
  Sparkles, // Icon for new feature
} from "lucide-react";

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  // ... existing code

  return (
    <nav>
      {/* ... existing menu items */}

      {/* Management Section */}
      {user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? (
        <div className="mt-8">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Management
          </h3>
          <ul className="space-y-1">
            {/* ... existing menu items */}

            {/* New Feature Menu Item */}
            <li>
              <Link
                href="/panel/new-features"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/panel/new-features"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Sparkles className="h-5 w-5" />
                <span>New Features</span>
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
```

### ⚠️ Important Notes

- **Role-based visibility** should be checked
- **Active state** should be checked with pathname
- **Icon** should use an appropriate icon
- **Styling** should match existing sidebar pattern

---

## ✅ Final Checklist

After completing all steps, check:

- [ ] Database migration ran successfully
- [ ] Type definitions added to `@packages/types` and exported
- [ ] Backend service created and tested
- [ ] Backend routes created and added to app
- [ ] Frontend service created and tested
- [ ] Frontend page created and working
- [ ] Menu item added to sidebar
- [ ] Authentication/Authorization checked
- [ ] Error handling implemented
- [ ] Loading states displayed
- [ ] No TypeScript errors
- [ ] No linter errors

---

## 🎯 Example: Complete Feature Flow

1. **Database**: `NewFeature` model added
2. **Types**: `packages/types/src/new-feature.ts` created
3. **Backend Service**: `apps/api/src/services/new-feature.service.ts` created
4. **Backend Routes**: `apps/api/src/routes/new-feature.ts` created and added to app
5. **Frontend Service**: `apps/web/services/new-feature.service.ts` created
6. **Frontend Page**: `apps/web/app/(panel)/panel/new-features/page.tsx` created
7. **Sidebar**: `apps/web/components/panel/sidebar.tsx` updated

---

## 📚 Related Documentation

- [API Development Guidelines](./api.md)
- [Frontend Development Guidelines](./frontend.md)
- [Database Guidelines](./database.md)
- [Backend Guidelines](./backend.md)
- [Project Structure](./structure.md)

---

**Last Updated**: 2026-01-12
