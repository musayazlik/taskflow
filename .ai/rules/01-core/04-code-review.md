# Code Review Checklist (TaskFlow)

This document serves as a comprehensive checklist for reviewing code in the TaskFlow project. It is designed to ensure code quality, consistency, security, and architectural integrity across the monorepo.

---

## 🧠 General (Stack Agnostic)

### Core Principles

- [ ] **Single Responsibility Principle (SRP)**: Does each file, function, and service perform a single, well-defined task?
- [ ] **Naming Conventions**: Is the naming clear and domain-specific? (e.g., `userSettings`, `billingCycle`, `subscriptionPlan` instead of generic names like `data`, `config`).
- [ ] **Dead Code**: Are there any unused exports, variables, or imports that should be removed?
- [ ] **Side Effects**: Are side effects (especially in server actions and hooks) explicit and managed correctly?
- [ ] **Environment Variables**: Are env variables handled securely? (e.g., `process.env` should not be leaked to the client directly; use validated config).
- [ ] **Magic Numbers/Strings**: Are magic strings and numbers replaced with enums or constants?
- [ ] **Error Handling**: Is there robust error handling, or does the code only cover the "happy path"?
- [ ] **Logging**: Is the log level appropriate? (No `console.log` in production; use structured logging like `pino`).

### 🔄 Refactor Indicators

#### Code Duplication (DRY Violations)

- [ ] **Repeated Logic**: Is the same logic duplicated across multiple files/functions?
  - ❌ Same validation logic in multiple places
  - ✅ Shared validation schemas in `@repo/validations`
- [ ] **Copy-Paste Code**: Are there blocks of code that are nearly identical?
  - ❌ Similar CRUD operations repeated for each model
  - ✅ Generic service functions or base classes
- [ ] **Repeated Patterns**: Are common patterns extracted into reusable utilities?
  - ❌ Same error handling pattern repeated
  - ✅ Centralized error handling middleware/helpers

#### Complexity Reduction (KISS Principle)

- [ ] **Over-Engineering**: Is the code simpler than it needs to be?
  - ❌ Unnecessary abstractions, factories, or design patterns
  - ✅ Direct, straightforward implementations
- [ ] **Nested Conditionals**: Are there deeply nested if/else statements?
  - ❌ 3+ levels of nesting
  - ✅ Early returns, guard clauses, or extracted functions
- [ ] **Function Length**: Are functions doing too much?
  - ❌ Functions exceeding 30-50 lines
  - ✅ Small, focused functions (10-20 lines ideal)

#### Architecture & Structure

- [ ] **File Organization**: Are related files grouped logically?
  - ❌ Related code scattered across multiple directories
  - ✅ Feature-based or domain-based organization
- [ ] **Import Dependencies**: Are there circular dependencies or deep import chains?
  - ❌ `import { x } from "../../../../utils"`
  - ✅ Path aliases (`@/`) and barrel exports (`index.ts`)
- [ ] **Separation of Concerns**: Are concerns properly separated?
  - ❌ Business logic in UI components or route handlers
  - ✅ Clear separation: Routes → Services → Database

#### Type Safety & Maintainability

- [ ] **Type Coverage**: Are there `any` types or type assertions that could be improved?
  - ❌ `as unknown as Type` or `any` types
  - ✅ Proper type definitions and generics
- [ ] **Shared Types**: Are types duplicated between frontend and backend?
  - ❌ Same type defined in multiple places
  - ✅ Shared types in `@repo/types`
- [ ] **Type Narrowing**: Are type guards used effectively?
  - ❌ Runtime type checks without proper narrowing
  - ✅ Type guards and discriminated unions

#### Performance & Optimization

- [ ] **Unnecessary Re-renders**: Are components re-rendering unnecessarily?
  - ❌ Missing memoization for expensive computations
  - ✅ `useMemo`, `useCallback` where appropriate
- [ ] **Database Queries**: Are queries optimized?
  - ❌ N+1 queries or fetching unnecessary data
  - ✅ Proper `select`, `include`, and pagination
- [ ] **Bundle Size**: Are there opportunities to reduce bundle size?
  - ❌ Importing entire libraries for single functions
  - ✅ Tree-shakeable imports and code splitting

#### Refactor Priorities

1. **High Priority**: Code duplication, security issues, performance bottlenecks
2. **Medium Priority**: Type safety improvements, architectural inconsistencies
3. **Low Priority**: Code style, minor optimizations, documentation

#### When to Refactor

- ✅ **Refactor Now**: Code is duplicated 3+ times, or causes bugs/maintenance issues
- ⚠️ **Refactor Soon**: Code is duplicated 2 times, or makes future changes difficult
- 📝 **Refactor Later**: Code works but could be cleaner (document with TODO if needed)

---

## ⚛️ Web – Next.js (App Router)

### 1️⃣ Architecture & Folder Structure

- [ ] **Routing vs. Logic**: Does `app/` strictly handle routing and composition?
- [ ] **Business Logic Placement**:
  - ❌ Business logic in `page.tsx`
  - ✅ Logic moved to `features/`, `services/`, or `hooks/`
- [ ] **Component Classification**:
  - `components/ui`: Dumb/presentational components
  - `components/features`: Domain-aware components
- [ ] **Responsibility**: Page components should orchestrate; UI components should render.

### 2️⃣ Server / Client Boundary

- [ ] **"use client" Usage**: Is `"use client"` minimized and used only when necessary?
- [ ] **Server Components**: Ensure no client-side specific APIs (e.g., `useEffect`, `window`, `localStorage`) are used in Server Components.
- [ ] **Client Components**: Avoid heavy data fetching directly in Client Components.
- [ ] **Data Fetching Strategy**: Fetch data on the server, manage state on the client.

### 3️⃣ Data Fetching

- [ ] **Caching Strategy**: Are fetch cache settings (`no-store`, `revalidate`) explicitly defined?
- [ ] **Service Layer**:
  - ❌ Fetching the same endpoint in multiple places
  - ✅ Using a unified service layer for API calls
- [ ] **Parallel Fetching**: Are independent data fetches executed in parallel (e.g., using `Promise.all`)?

### 4️⃣ Performance

- [ ] **Re-renders**: Are unnecessary re-renders avoided?
- [ ] **Memoization**: Are `useMemo` and `useCallback` used effectively (not just reflexively)?
- [ ] **Large Lists**: Is pagination or virtualization used for large datasets?
- [ ] **Image Optimization**: Is `next/image` used for images?
- [ ] **Bundle Size**: Are there any heavy libraries bloating the bundle?

### 5️⃣ Form & Validation

- [ ] **Validation Layer**:
  - ❌ Validation logic only in the frontend
  - ✅ Shared Zod schemas used for both frontend and backend
- [ ] **User Feedback**: Are validation errors and success states clearly communicated to the user?
- [ ] **Optimistic UI**: If used, is there a rollback mechanism for failed operations?

### 6️⃣ DX & Maintainability

- [ ] **Reusable Hooks**: Are custom hooks truly reusable and logic-focused?
  - ❌ Hook rendering UI
  - ✅ Hook managing logic only
- [ ] **Type Safety**:
  - ❌ Avoid `any` and `as unknown as`
  - ✅ Ensure API responses are fully type-safe via shared types

---

## 🦊 API – Elysia.js

### 1️⃣ Route Structure

- [ ] **Logic Separation**:
  - ❌ Routes containing business logic
  - ✅ Routes strictly handling HTTP request/response orchestration
- [ ] **Layered Architecture**: Is there a clear separation between Controller, Service, and Repository layers?

### 2️⃣ Elysia Best Practices

- [ ] **Schema Validation**: Are `t.Object`, `t.Enum`, and other TypeBox schemas used for validation?
- [ ] **Schema Definition**: Are request/response schemas explicitly defined?
- [ ] **Shared Schemas**: Are schemas shared with the frontend for consistency?
  ```typescript
  .get("/users", handler, {
      query: t.Object({
          page: t.Number(),
          limit: t.Number()
      })
  })
  ```
- [ ] **Schema Role**: Treat schemas as validation, documentation, and type safety mechanisms.

### 3️⃣ Auth & Security

- [ ] **Auth Implementation**:
  - ❌ scattered auth checks in routes
  - ✅ centralized middleware or `derive` usage
- [ ] **Role Checking**: Is there a central helper for role-based access control?
- [ ] **Error Security**:
  - ❌ Leaking database errors (e.g., "User not found in DB query")
  - ✅ Returning standardized errors (e.g., "Unauthorized")

### 4️⃣ Error Handling

- [ ] **Global Handling**: Is error handling managed globally or delegated to Elysia?
- [ ] **Custom Errors**: Are custom error types used?
  ```typescript
  throw new AppError("USER_NOT_FOUND", 404);
  ```
- [ ] **Status Codes**: Are HTTP status codes used consistently and correctly?

### 5️⃣ Database / ORM

- [ ] **N+1 Queries**: Are potential N+1 query issues identified and resolved?
- [ ] **Transactions**: Are database transactions used where atomicity is required?
- [ ] **Pagination**:
  - ❌ Fetching all records (`findMany()` without limits)
  - ✅ Using `take`, `skip`, or cursor-based pagination
- [ ] **Indexing**: Are database indexes applied to frequently queried fields?

### 6️⃣ Performance

- [ ] **Heavy Operations**: Are heavy computations handled asynchronously or offloaded to background jobs?
- [ ] **Response Size**: Is the response payload optimized (no unnecessary data)?
- [ ] **Await Chains**: Are unnecessary sequential `await` calls avoided?

---

## 🔗 Web ↔ API Consistency

- [ ] **Response Shape**:
  - ❌ Inconsistent response formats
  - ✅ Standardized response structure:
    ```typescript
    {
      success: boolean;
      data?: T;
      error?: {
        code: string;
        message: string;
      };
    }
    ```
- [ ] **Shared Types**: Is there a shared `@repo/types` or schema package used by both ends?
- [ ] **Breaking Changes**: Does the type system catch breaking changes across the boundary?

---

## 🚩 Red Flags (Immediate Changes Required)

- [ ] **Effect Fetching**: `useEffect` containing direct fetch calls without a robust strategy.
- [ ] **Direct DB Access**: API routes accessing the database directly instead of through a service.
- [ ] **Logic in Pages**: Next.js pages containing complex business logic.
- [ ] **Massive Components**: Components exceeding 500 lines of code.
- [ ] **"Refactor Later"**: Comments promising future refactoring ("TODO: fix later") without immediate plans.
