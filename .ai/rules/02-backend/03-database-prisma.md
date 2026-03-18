# Database & Prisma

> Schema rules, migration management, query optimization

## 📝 Schema Conventions

### Model Definition

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)

  // Relations
  posts     Post[]

  // Timestamps (ALWAYS include)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Table mapping (snake_case)
  @@map("users")

  // Indexes
  @@index([email])
  @@index([createdAt])
}

enum Role {
  USER
  ADMIN
}
```

### Naming Conventions

| Type          | Convention | Example         |
| ------------- | ---------- | --------------- |
| Model         | PascalCase | `User`          |
| Field         | camelCase  | `firstName`     |
| Enum          | PascalCase | `USER`, `ADMIN` |
| Table (@@map) | snake_case | `users`         |

### Field Types

```prisma
// String
email    String           // 255 chars
bio      String?          // Nullable
content  String  @db.Text // Unlimited

// Numeric
age      Int
price    Decimal @db.Decimal(10, 2) // Currency - NEVER Float
quantity Int     @default(0)

// Date
birthDate DateTime @db.Date
createdAt DateTime @default(now())

// Other
isActive Boolean @default(true)
metadata Json?
tags     String[]
```

## 🔄 Migrations

```bash
# Create migration
cd packages/database
bunx prisma migrate dev --name add_user_profile

# Apply migrations
bunx prisma migrate deploy

# Generate client
bunx prisma generate
```

## ⚡ Query Optimization

### Select Specific Fields

```typescript
// ✅ Good
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, name: true },
});
```

### Include Relations

```typescript
// ✅ Good - Single query
const users = await prisma.user.findMany({
  include: {
    posts: {
      where: { published: true },
      take: 5,
      orderBy: { createdAt: "desc" },
    },
  },
});
```

### Pagination

```typescript
// Offset-based
const users = await prisma.user.findMany({
  skip: 0,
  take: 10,
  orderBy: { createdAt: "desc" },
});

// Cursor-based (better for large datasets)
const users = await prisma.user.findMany({
  take: 10,
  cursor: { id: lastId },
  orderBy: { id: "asc" },
});
```

### Bulk Operations

```typescript
// ✅ Good - Single query
await prisma.user.updateMany({
  where: { id: { in: userIds } },
  data: { status: "ACTIVE" },
});

await prisma.user.createMany({
  data: usersData,
  skipDuplicates: true,
});
```

### Transactions

```typescript
const [user, profile] = await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.profile.create({ data: profileData }),
]);
```

## 🔒 Security Best Practices

### 1. Never Expose Passwords

```typescript
// ✅ Good - select specific fields
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    // password excluded
  },
});

// ✅ Good - sanitize in service
function sanitizeUser(user: User) {
  const { password, ...sanitized } = user;
  return sanitized;
}

// ❌ Bad - returning all fields
const user = await prisma.user.findUnique({
  where: { id: userId },
});
return user; // Includes password!
```

### 2. Validate IDs

```typescript
import { z } from "zod";

const idSchema = z.string().cuid();

async function getUser(id: string) {
  // Validate ID format
  const validatedId = idSchema.parse(id);

  return prisma.user.findUnique({
    where: { id: validatedId },
  });
}
```

### 3. Use Parameterized Queries

Prisma automatically uses parameterized queries, but if using raw SQL:

```typescript
// ✅ Good - parameterized
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;

// ❌ Bad - string interpolation
const users = await prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

## 📦 Type Exports

```typescript
// Import types from the package
import { prisma, type User, type Role } from "@repo/database";

// Use in function signatures
async function createUser(data: {
  email: string;
  name?: string;
  role?: Role;
}): Promise<User> {
  return prisma.user.create({ data });
}
```

## 📋 Best Practices Checklist

### Schema Design ✅

- [ ] Use `cuid()` for IDs (better than `uuid()`)
- [ ] Always include `createdAt` and `updatedAt`
- [ ] Use `@@map` for snake_case table names
- [ ] Define cascade behavior on relations
- [ ] Add appropriate indexes for queries

### Queries ✅

- [ ] Use `select` to fetch only needed fields
- [ ] Never return password fields
- [ ] Use transactions for related operations
- [ ] Implement pagination for list queries
- [ ] Handle null cases appropriately

### Security ✅

- [ ] Validate all input IDs
- [ ] Use Prisma's parameterized queries
- [ ] Sanitize user data before returning
- [ ] Limit query results with `take`

## 🤖 AI MUST Rules

1. **Use cuid() for IDs** - Not auto-increment
2. **Include timestamps** - createdAt and updatedAt
3. **Use @@map()** - snake_case table names
4. **Add indexes** - On foreign keys and query fields
5. **Use Decimal for money** - Never Float
6. **Set proper onDelete** - Cascade or Restrict
7. **Select specific fields** - Don't fetch unnecessary data
8. **Use transactions** - For multi-table operations
9. **Never expose passwords** - Use select or sanitize
10. **Validate IDs** - Use Zod schemas
