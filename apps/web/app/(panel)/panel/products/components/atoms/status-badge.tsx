import { ArchiveX, Star } from "lucide-react";

export function StatusBadge({ isArchived }: { isArchived?: boolean }) {
	if (isArchived) {
		return (
			<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-700/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-600">
				<ArchiveX className="h-3 w-3" />
				Archived
			</span>
		);
	}
	return (
		<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30">
			<Star className="h-3 w-3" />
			Active
		</span>
	);
}
