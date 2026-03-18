# Clean Code Standards

> DRY, KISS, SOLID principles and naming conventions

## 🎯 Core Principles

### DRY (Don't Repeat Yourself)

```typescript
// ❌ BAD - Duplicated validation
async function createUser(data) {
  if (!data.email.includes("@")) throw new Error("Invalid email");
  // ...
}
async function updateUser(data) {
  if (!data.email.includes("@")) throw new Error("Invalid email");
  // ...
}

// ✅ GOOD - Reuse validation
import { emailSchema } from "@repo/validations";
const validated = emailSchema.parse(data.email);
```

### KISS (Keep It Simple)

```typescript
// ❌ BAD - Over-engineered
class UserManagerFactory {
  static createManager(type: string) {
    /* ... */
  }
}

// ✅ GOOD - Simple and direct
import { userService } from "@/services/user.service";
const user = await userService.getById(id);
```

### Single Responsibility

```typescript
// ✅ GOOD - Each function does one thing
async function validateCredentials(email: string, password: string) {
  /* ... */
}
async function generateTokens(userId: string, role: string) {
  /* ... */
}
async function login(credentials: LoginInput) {
  const user = await validateCredentials(
    credentials.email,
    credentials.password
  );
  return generateTokens(user.id, user.role);
}
```

## 📝 Naming Conventions

### Boolean Naming - Use Prefixes

```typescript
// ✅ CORRECT
const isLoading = true;
const hasPermission = false;
const canEdit = user.role === "ADMIN";
const shouldRefresh = token.isExpired;

// ❌ WRONG
const loading = true;
const permission = false;
const editable = true;
```

### API Endpoints - RESTful

```typescript
// ✅ CORRECT
GET    /users           // List
GET    /users/:id       // Get one
POST   /users           // Create
PUT    /users/:id       // Update full
PATCH  /users/:id       // Update partial
DELETE /users/:id       // Delete

// ❌ WRONG
GET    /getUsers
POST   /createUser
```

## 🏗️ Code Organization

### Early Returns

```typescript
// ❌ BAD - Deep nesting
async function getUser(id: string) {
  if (id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
      if (user.isActive) {
        return user;
      }
    }
  }
}

// ✅ GOOD - Early returns
async function getUser(id: string) {
  if (!id) throw new ValidationError("ID required");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError("User");
  if (!user.isActive) throw new ForbiddenError("User is inactive");
  return user;
}
```

## 🚨 Error Handling

### Use Custom Error Classes

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}
```

## 📦 TypeScript Best Practices

### Avoid `any`

```typescript
// ✅ Use proper types or unknown
function processUser(user: User): UserResponse {...}
function parseJSON(json: string): unknown {...}

// ❌ Bad
function processUser(user: any): any {...}
```

### Utility Types

```typescript
type UserWithoutPassword = Omit<User, "password">;
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
```

## 📖 Documentation

### JSDoc Comments

```typescript
/**
 * Authenticates a user with email and password.
 * @throws {UnauthorizedError} If credentials don't match
 */
export async function login(credentials: LoginInput): Promise<AuthResponse> {...}
```

## 📋 Code Review Checklist

- [ ] Code follows naming conventions
- [ ] No `any` types
- [ ] Error handling implemented
- [ ] Input validation with Zod
- [ ] No console.log in production
- [ ] Functions are focused (single responsibility)

## 🤖 AI MUST Rules

1. **Descriptive names** - Never single-letter variables (except loops)
2. **Boolean prefixes** - is/has/can/should/will
3. **Keep functions small** - Max 20-30 lines
4. **Use early returns** - Minimize nesting
5. **Follow file conventions** - PascalCase for components, kebab-case for utilities
6. **Use custom errors** - Never throw raw Error objects
7. **Avoid `any`** - Use proper types or `unknown`
