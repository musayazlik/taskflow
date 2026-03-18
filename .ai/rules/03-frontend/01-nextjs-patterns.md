# Next.js Patterns

> App Router, Server/Client components, Server Actions

## 🏗️ Component Architecture

### Default to Server Components
Next.js 16 defaults to Server Components. Use them unless interactivity needed.

```tsx
// ✅ Good - Server Component by default
// app/(panel)/panel/users/page.tsx
import { api } from "@/lib/api";

export default async function UsersPage() {
  const { data: users } = await api.users.get();
  return <UsersTable users={users} />;
}
```

### When to Use Client Components
Add `"use client"` only for:
- Browser APIs (localStorage, window, document)
- React hooks (useState, useEffect, useCallback)
- Event handlers (onClick, onSubmit)
- Third-party client-side libraries

```tsx
// ✅ Good - Client Component for interactivity
"use client";

import { useState } from "react";

export function UserForm() {
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  };
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 🔄 Data Fetching

### Server Component Fetching
```tsx
// ✅ Good - Fetch directly in Server Components
export default async function DashboardPage() {
  const [users, orders, stats] = await Promise.all([
    api.users.get(),
    api.orders.get(),
    api.stats.get(),
  ]);
  return <Dashboard users={users.data} orders={orders.data} stats={stats.data} />;
}
```

### With Revalidation
```tsx
export const revalidate = 60;

export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products', {
    next: { tags: ['products'] }
  });
  return <ProductList products={await products.json()} />;
}
```

## ⚡ Server Actions

### "use server" Directive
```typescript
// lib/actions/user.ts
"use server";

import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function updateUser(userId: string, data: UpdateUserInput) {
  const result = await api.users[userId].put(data);
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/panel/users/${userId}`);
  return result.data;
}
```

### Using in Client Components
```tsx
"use client";

import { updateUser } from "@/lib/actions/user";

export function EditUserForm({ userId }) {
  const handleSubmit = async (formData: FormData) => {
    const data = Object.fromEntries(formData);
    await updateUser(userId, data as UpdateUserInput);
  };
  return <form action={handleSubmit}>...</form>;
}
```

## 🎨 Loading and Error States

```tsx
// loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

// error.tsx
"use client";
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## 🤖 AI MUST Rules

1. **Default to Server Components** - Only add `"use client"` when necessary
2. **Fetch data in Server Components** - Use async/await in pages
3. **Use Server Actions for mutations** - With `"use server"` directive
4. **Separate client/server logic** - Don't mix concerns
5. **Use Zustand for global state** - Not React Context
6. **Handle errors gracefully** - Use error.tsx and notFound()
7. **Add loading states** - Create loading.tsx for async pages
