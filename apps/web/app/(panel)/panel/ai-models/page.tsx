import { Metadata } from "next";
import { Suspense } from "react";
import { AIModelsPageClient } from "./components/ai-models-page-client";
import { getAIModelsServer } from "@/services/server";

export const metadata: Metadata = {
  title: "AI Models | TurboStack Admin Panel",
  description:
    "Manage AI models and providers. Configure model settings, track usage, and optimize AI integrations.",
  robots: {
    index: false,
    follow: false,
  },
};

interface AIModelsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    activeOnly?: string;
    provider?: string;
  }>;
}

function AIModelsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
      <div className="h-96 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
    </div>
  );
}

export default async function AIModelsPage({
  searchParams,
}: AIModelsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? parseInt(params.limit, 10) : 10;
  const activeOnly = params.activeOnly === "true";
  const provider = params.provider;

  const { models, total, page: currentPage, pageSize, totalPages } =
    await getAIModelsServer({
      page,
      limit,
      activeOnly,
      provider,
    });

  return (
    <Suspense fallback={<AIModelsPageSkeleton />}>
      <AIModelsPageClient
        initialModels={models}
        initialTotal={total}
        initialPage={currentPage}
        initialPageSize={pageSize}
        initialTotalPages={totalPages}
      />
    </Suspense>
  );
}
