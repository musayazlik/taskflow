import path from "node:path";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
// Use better-auth's password hashing to ensure compatibility
import { hashPassword } from "better-auth/crypto";

// Load .env from monorepo root first, then fallback to apps/api/.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.join(__dirname, "../../../.env");
const apiEnvPath = path.join(__dirname, "../../../apps/api/.env");

// Try root .env first, then apps/api/.env
config({ path: rootEnvPath });
if (!process.env.DATABASE_URL) {
  config({ path: apiEnvPath });
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please set it in .env or apps/api/.env",
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

async function ensureEnumType(
  prismaClient: PrismaClient,
  name: string,
  values: string[],
) {
  const valuesSql = values.map((v) => `'${v.replace(/'/g, "''")}'`).join(", ");

  // Create enum type only if it doesn't exist.
  // Using DO $$ ... $$ because Postgres doesn't support CREATE TYPE IF NOT EXISTS.
  await prismaClient.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = '${name}'
          AND n.nspname = 'public'
      ) THEN
        CREATE TYPE public."${name}" AS ENUM (${valuesSql});
      END IF;
    END $$;
  `);
}

async function main() {
  console.log("🌱 Starting database seed...\n");

  // TaskFlow + BetterAuth schema relies on a few Postgres enum types.
  // If migrations weren't applied yet, Prisma will fail with:
  // "type public.<EnumName> does not exist".
  // We ensure these enum types exist so the seed can proceed.
  await ensureEnumType(prisma, "Role", ["USER", "ADMIN", "SUPER_ADMIN"]);
  await ensureEnumType(prisma, "TaskStatus", ["TODO", "IN_PROGRESS", "DONE"]);
  await ensureEnumType(prisma, "NotificationType", [
    "TASK_CREATED",
    "TASK_UPDATED",
    "TASK_ASSIGNED",
  ]);

  // ============================================
  // 1. Seed Users
  // ============================================
  console.log("👤 Seeding users...");
  const superAdminPassword = await hashPassword("demo123");
  const adminPassword = await hashPassword("demo123");
  const userPassword = await hashPassword("demo123");

  const users = [
    {
      email: "superadmin@demo.com",
      name: "Super Admin",
      role: "SUPER_ADMIN" as const,
      password: superAdminPassword,
    },
    {
      email: "admin@demo.com",
      name: "Admin User",
      role: "ADMIN" as const,
      password: adminPassword,
    },
    {
      email: "user@demo.com",
      name: "Regular User",
      role: "USER" as const,
      password: userPassword,
    },
  ];

  for (const user of users) {
    // Upsert user
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        role: user.role,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        skills: [], // Default empty array
      },
    });

    // Upsert credential account (where better-auth stores passwords)
    // Better Auth uses email as accountId for credential provider
    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: user.email,
        },
      },
      update: {
        password: user.password,
      },
      create: {
        userId: createdUser.id,
        providerId: "credential",
        accountId: user.email,
        password: user.password,
      },
    });

    console.log(`  ✓ ${user.email} (${user.role})`);
  }
  console.log(`✅ ${users.length} users seeded.\n`);

  // ============================================
  // 3. Seed Global Settings
  // ============================================
  console.log("⚙️  Seeding global settings...");

  await prisma.globalSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      primaryColor: "oklch(0.55 0.25 280)",
      primaryForeground: "oklch(0.99 0 0)",
      secondaryColor: "oklch(0.97 0 0)",
      secondaryForeground: "oklch(0.205 0 0)",
    },
  });

  console.log("  ✓ Default global settings created");
  console.log("✅ Global settings seeded.\n");

  // ============================================
  // 4. Seed TaskFlow (Tasks + Notifications)
  // ============================================
  console.log("🧩 Seeding TaskFlow tasks and notifications...");

  // Get user IDs (used as task owners/assignees)
  const superAdminUser = await prisma.user.findUnique({
    where: { email: "superadmin@demo.com" },
  });
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@demo.com" },
  });
  const regularUser = await prisma.user.findUnique({
    where: { email: "user@demo.com" },
  });

  if (!superAdminUser || !adminUser || !regularUser) {
    console.log("  ⚠️  Users not found, skipping tasks/notifications seeding");
  } else {
    try {
      const seedTasks = [
        {
          id: "seed-task-1",
          title: "Welcome Task",
          description: "This is your first TaskFlow task.",
          status: "TODO" as const,
          ownerId: superAdminUser.id,
          assigneeId: adminUser.id,
        },
        {
          id: "seed-task-2",
          title: "Ship Realtime Updates",
          description: "Assign and move this task to IN_PROGRESS.",
          status: "IN_PROGRESS" as const,
          ownerId: regularUser.id,
          assigneeId: adminUser.id,
        },
        {
          id: "seed-task-3",
          title: "Close the Loop",
          description: "When done, mark it as DONE.",
          status: "DONE" as const,
          ownerId: regularUser.id,
          assigneeId: null,
        },
      ];

      for (const task of seedTasks) {
        await prisma.task.upsert({
          where: { id: task.id },
          update: {
            title: task.title,
            description: task.description,
            status: task.status,
            ownerId: task.ownerId,
            assigneeId: task.assigneeId,
          },
          create: {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            ownerId: task.ownerId,
            assigneeId: task.assigneeId,
          },
        });
      }

      const seedNotifications = [
        {
          id: "seed-notif-1",
          type: "TASK_CREATED" as const,
          message: "Task created: Welcome Task",
          read: false,
          userId: superAdminUser.id,
          taskId: "seed-task-1",
        },
        {
          id: "seed-notif-2",
          type: "TASK_ASSIGNED" as const,
          message: "You were assigned a task: Welcome Task",
          read: false,
          userId: adminUser.id,
          taskId: "seed-task-1",
        },
        {
          id: "seed-notif-3",
          type: "TASK_UPDATED" as const,
          message: "Task updated: Ship Realtime Updates",
          read: false,
          userId: regularUser.id,
          taskId: "seed-task-2",
        },
      ];

      for (const notif of seedNotifications) {
        await prisma.notification.upsert({
          where: { id: notif.id },
          update: {
            type: notif.type,
            message: notif.message,
            read: notif.read,
            userId: notif.userId,
            taskId: notif.taskId,
          },
          create: {
            id: notif.id,
            type: notif.type,
            message: notif.message,
            read: notif.read,
            userId: notif.userId,
            taskId: notif.taskId,
          },
        });
      }

      console.log(`  ✓ ${seedTasks.length} tasks seeded`);
      console.log(`  ✓ ${seedNotifications.length} notifications seeded\n`);
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      console.log(`  ⚠️  TaskFlow seeding skipped: ${err}\n`);
    }
  }

  // ============================================
  // Summary
  // ============================================
  console.log("📋 Login credentials:");
  console.log("  Super Admin: superadmin@demo.com / demo123");
  console.log("  Admin:       admin@demo.com / demo123");
  console.log("  User:        user@demo.com / demo123");
  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
