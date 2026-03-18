import { Metadata } from "next";
import { Suspense } from "react";
import { MediaPageClient } from "./components/media-page-client";
import { getMediaFilesServer } from "@/services/server";

export const metadata: Metadata = {
  title: "Media | TurboStack Admin Panel",
  description:
    "Manage your media files. Upload, organize, and optimize images and other media assets.",
  robots: {
    index: false,
    follow: false,
  },
};

interface MediaPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
}

function MediaPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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

export default async function MediaPage({ searchParams }: MediaPageProps) {
  const params = await searchParams;
  const limit = params.limit ? parseInt(params.limit, 10) : 100;
  const offset = params.page
    ? (parseInt(params.page, 10) - 1) * limit
    : 0;

  const { files, hasMore } = await getMediaFilesServer({
    limit,
    offset,
  });

  return (
    <Suspense fallback={<MediaPageSkeleton />}>
      <MediaPageClient initialFiles={files} initialHasMore={hasMore} />
    </Suspense>
  );
}
