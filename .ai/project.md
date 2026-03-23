# 🚀 TaskFlow

**TaskFlow** is a real-time task management system built with **Next.js, NestJS, PostgreSQL, Prisma, and WebSockets**.
It demonstrates clean architecture, monorepo structure, and event-driven design.

---

# 🧭 Overview

TaskFlow allows users to:

- Create and manage tasks
- Assign tasks to other users
- Receive real-time updates via WebSockets
- Get notifications based on task activity

---

# 🏗️ Architecture

## 🧱 Monorepo (Turborepo)

```
apps/
  web/        → Next.js frontend
  api/        → NestJS backend

packages/
  shadcn-ui/         → shared components (optional)
  config/     → shared configs

prisma/
  schema.prisma
```

---

## ⚙️ Tech Stack

- **Frontend:** Next.js (App Router)
- **Backend:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT (Better Auth compatible)
- **Realtime:** WebSocket (NestJS Gateway)
- **Monorepo:** Turborepo

---

# 🧠 Domain Structure

```
modules/
  auth/
  task/
  notification/
```

---

# 🗄️ Database Models (Prisma)

## 🔐 Enums

```prisma
enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum NotificationType {
  TASK_CREATED
  TASK_UPDATED
  TASK_ASSIGNED
}
```

---

## 👤 User

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  password        String?
  role            Role      @default(USER)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  sessions        Session[]
  accounts        Account[]

  tasks           Task[] @relation("UserTasks")
  assignedTasks   Task[] @relation("AssignedTasks")
  notifications   Notification[]
}
```

---

## 📋 Task

```prisma
model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  ownerId     String
  owner       User       @relation("UserTasks", fields: [ownerId], references: [id], onDelete: Cascade)

  assigneeId  String?
  assignee    User?      @relation("AssignedTasks", fields: [assigneeId], references: [id])

  notifications Notification[]
}
```

---

## 🔔 Notification

```prisma
model Notification {
  id        String            @id @default(cuid())
  type      NotificationType
  message   String
  read      Boolean           @default(false)

  createdAt DateTime          @default(now())

  userId    String
  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  taskId    String?
  task      Task?             @relation(fields: [taskId], references: [id], onDelete: Cascade)
}
```

---

## 🔐 Session

```prisma
model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime
  token     String   @unique
  userId    String

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

# 🔄 System Flow

## 🧩 Task Creation Flow

1. User creates task
2. Task saved to DB
3. WebSocket event emitted → `task.created`
4. Notification created
5. Frontend updates in real-time

---

## ⚡ Realtime Events

- `task.created`
- `task.updated`
- `task.assigned`

---

# 🖥️ Frontend Structure

```
/app
  /dashboard
  /tasks
  /notifications
  /settings
```

---

# 🎛️ Panel Structure

## 👤 User Panel

### Menü:

- Dashboard
- Tasks
- Notifications
- Settings

### Açıklama:

- **Dashboard:** General overview (task count, etc.)
- **Tasks:** User's task list
- **Notifications:** Notifications
- **Settings:** Profile settings

---

## 🛠️ Admin Panel

### Menü:

- Dashboard
- Users
- Tasks
- Notifications
- System Logs (optional)

### Açıklama:

- **Users:** User management
- **Tasks:** See all tasks
- **Notifications:** System notifications
- **Logs:** Event / activity log

---

# 🔐 Authorization

- JWT based authentication
- Role-based access:

| Role        | Permissions          |
| ----------- | -------------------- |
| USER        | Own tasks only       |
| ADMIN       | Manage users & tasks |
| SUPER_ADMIN | Full access          |

---

# ⚡ WebSocket Architecture

- NestJS Gateway
- Event-based communication
- Client subscribes on login

---

# 🧪 Example Event

```json
{
  "event": "task.updated",
  "data": {
    "taskId": "123",
    "status": "DONE"
  }
}
```

---

# 📄 API Documentation

- Swagger enabled at:

```
/api/docs
```

---

# 🚀 Getting Started

```bash
# install
pnpm install

# dev
pnpm dev

# prisma
pnpm prisma migrate dev
```

---

# 🧠 Design Decisions

- Monorepo for scalability
- Feature-based architecture
- Event-driven system (task → notification)
- Prisma for type-safe DB access

---

# 🎯 Goal of This Project

This project is designed as a **technical case study** to demonstrate:

- Clean architecture
- Realtime systems
- Scalable backend design
- Production-ready patterns

---

# ✨ Author

**Musa Yazlık**
