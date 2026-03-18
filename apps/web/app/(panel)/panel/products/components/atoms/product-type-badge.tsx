import { Repeat, CreditCard } from "lucide-react";

export function ProductTypeBadge({ isRecurring }: { isRecurring: boolean }) {
	if (isRecurring) {
		return (
			<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
				<Repeat className="h-3 w-3" />
				Subscription
			</span>
		);
	}
	return (
		<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
			<CreditCard className="h-3 w-3" />
			One-time
		</span>
	);
}
