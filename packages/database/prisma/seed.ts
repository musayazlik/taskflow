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

async function main() {
  console.log("🌱 Starting database seed...\n");

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
  // 4. Seed Dummy Tickets
  // ============================================
  console.log("🎫 Seeding dummy tickets...");

  // Get user IDs
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
    console.log("  ⚠️  Users not found, skipping ticket seeding");
  } else {
    const tickets = [
      {
        subject: "Payment issue with subscription",
        description:
          "I was charged twice for my monthly subscription. Please help me resolve this issue.",
        status: "open" as const,
        priority: "high" as const,
        userId: regularUser.id,
        assignedTo: adminUser.id,
        messages: [
          {
            content:
              "I was charged twice for my monthly subscription. Please help.",
            isInternal: false,
          },
          {
            content:
              "We're looking into this issue. Could you please provide your transaction ID?",
            isInternal: false,
            userId: adminUser.id,
          },
        ],
      },
      {
        subject: "Feature request: Dark mode",
        description:
          "Would love to have a dark mode option for the dashboard. It would be great for night-time usage.",
        status: "closed" as const,
        priority: "low" as const,
        userId: regularUser.id,
        assignedTo: adminUser.id,
        closedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        messages: [
          {
            content: "Would love to have a dark mode option for the dashboard.",
            isInternal: false,
          },
          {
            content:
              "Great news! Dark mode is already available. You can toggle it from your account settings.",
            isInternal: false,
            userId: adminUser.id,
          },
        ],
      },
      {
        subject: "API integration help",
        description:
          "Need assistance with API authentication. Getting 401 errors when trying to authenticate.",
        status: "in_progress" as const,
        priority: "medium" as const,
        userId: regularUser.id,
        assignedTo: adminUser.id,
        messages: [
          {
            content:
              "I'm having trouble with API authentication. Getting 401 errors.",
            isInternal: false,
          },
          {
            content:
              "Let me check your API key configuration. Can you share your API endpoint?",
            isInternal: false,
            userId: adminUser.id,
          },
        ],
      },
      {
        subject: "Account verification problem",
        description:
          "I'm unable to verify my email address. The verification link seems to be expired.",
        status: "open" as const,
        priority: "medium" as const,
        userId: regularUser.id,
        messages: [
          {
            content:
              "I'm unable to verify my email address. The verification link seems to be expired.",
            isInternal: false,
          },
        ],
      },
      {
        subject: "Bug report: Dashboard loading slowly",
        description:
          "The dashboard takes a very long time to load, especially on mobile devices. This is affecting my productivity.",
        status: "in_progress" as const,
        priority: "high" as const,
        userId: adminUser.id,
        assignedTo: superAdminUser.id,
        messages: [
          {
            content:
              "The dashboard takes a very long time to load, especially on mobile devices.",
            isInternal: false,
          },
          {
            content:
              "We're investigating performance issues. This might be related to recent updates.",
            isInternal: true,
            userId: superAdminUser.id,
          },
        ],
      },
    ];

    for (const ticketData of tickets) {
      const {
        messages,
        userId: ticketUserId,
        ...ticketFields
      } = ticketData as {
        messages: { content: string; isInternal: boolean; userId?: string }[];
        userId: string;
        subject: string;
        description: string;
        status: string;
        priority: string;
      };
      const createdTicket = await prisma.ticket.create({
        data: {
          ...ticketFields,
          userId: ticketUserId,
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          ), // Random date within last 30 days
        },
      });

      // Create messages for this ticket
      for (const messageData of messages) {
        const { userId, ...messageFields } = messageData;
        await prisma.ticketMessage.create({
          data: {
            ticketId: createdTicket.id,
            userId: userId ?? ticketUserId ?? "",
            content: messageFields.content,
            isInternal: messageFields.isInternal ?? false,
            createdAt: new Date(
              createdTicket.createdAt.getTime() +
                Math.random() * 7 * 24 * 60 * 60 * 1000,
            ), // Random date within 7 days of ticket creation
          },
        });
      }

      console.log(`  ✓ ${ticketData.subject} (${ticketData.status})`);
    }

    console.log(`✅ ${tickets.length} tickets seeded.\n`);
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
