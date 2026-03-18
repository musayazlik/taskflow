"use client";

import { useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarSkeleton } from "@/components/panel";
import { Header } from "@/components/panel";
import { PanelFooter } from "@/components/panel/footer";
import { useSession } from "@/lib/auth-client";
import { Skeleton } from "@repo/shadcn-ui/ui/skeleton";

// Note: Metadata is handled at the page level for SSR/SEO
// Client components cannot export metadata in Next.js

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { data: session, isPending } = useSession();

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as { role?: string }).role || "USER",
        image: session.user.image,
      }
    : null;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full z-40">
        <Suspense fallback={<SidebarSkeleton isCollapsed={sidebarCollapsed} />}>
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </Suspense>
      </div>

      {/* Header */}
      <Header
        sidebarCollapsed={sidebarCollapsed}
        user={user}
        isPending={isPending}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col pt-16 transition-all duration-300 bg-white dark:bg-zinc-950",
          sidebarCollapsed ? "md:pl-16" : "md:pl-64",
        )}
      >
        {/* Main Content */}
        <main className="flex-1 bg-white dark:bg-zinc-950">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">{children}</div>
        </main>

        {/* Footer - Content alanının altında */}
        <PanelFooter />
      </div>
    </div>
  );
}
