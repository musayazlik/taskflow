"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/panel/page-header";
import { StatsGrid, type StatItem } from "@/components/stats";
import {
	Users,
	UserPlus,
	TrendingUp,
	DollarSign,
	Loader2,
	Upload,
} from "lucide-react";
import { CustomersTable } from "./organisms/customers-table";
import { customerService, type Customer } from "@/services";
import { toast } from "sonner";

interface CustomersPageClientProps {
	initialCustomers: Customer[];
	initialTotal: number;
	initialPage: number;
	initialPageSize: number;
	initialTotalPages: number;
}

export function CustomersPageClient({
	initialCustomers,
	initialTotal,
	initialPage,
	initialPageSize,
	initialTotalPages,
}: CustomersPageClientProps) {
	const router = useRouter();
	const [importing, setImporting] = useState(false);

	// Stats calculations
	const statsItems = useMemo<StatItem[]>(() => {
		return [
			{
				label: "Total Customers",
				value: initialTotal,
				icon: Users,
				color: "blue",
				trend: "+12%",
			},
			{
				label: "New This Month",
				value: 0, // Would need date filtering
				icon: UserPlus,
				color: "green",
				trend: "+18%",
			},
			{
				label: "Growth Rate",
				value: "0%", // Would need historical data
				icon: TrendingUp,
				color: "emerald",
				trend: "+8%",
			},
			{
				label: "Avg. Value",
				value: "$0.00",
				icon: DollarSign,
				color: "purple",
				trend: "+5%",
			},
		];
	}, [initialTotal]);

	const handleImportFromPolar = useCallback(async () => {
		try {
			setImporting(true);
			const response = await customerService.importFromPolar();

			if (!response.success) {
				toast.error(response.error || "Import failed");
				return;
			}

			toast.success(response.message || "Customers imported successfully");
			router.refresh();
		} catch {
			toast.error("Failed to import customers");
		} finally {
			setImporting(false);
		}
	}, [router]);

	return (
		<div className="space-y-6">
			<PageHeader
				icon={Users}
				title="Customers"
				description="Customers synced with Polar.sh"
				actions={[
					{
						label: "Import from Polar",
						icon: importing ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Upload className="h-4 w-4" />
						),
						onClick: handleImportFromPolar,
						variant: "outline",
						disabled: importing,
						loading: importing,
					},
				]}
			/>

			<StatsGrid items={statsItems} />

			<CustomersTable
				customers={initialCustomers}
				total={initialTotal}
				page={initialPage}
				pageSize={initialPageSize}
				totalPages={initialTotalPages}
			/>
		</div>
	);
}
