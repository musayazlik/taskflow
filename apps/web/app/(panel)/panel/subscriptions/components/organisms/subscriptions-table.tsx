"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { DataTable, type Column, type DataTableAction } from "@/components/data-table";
import { SubscriptionCell } from "../molecules/subscription-cell";
import { CustomerCell } from "../molecules/customer-cell";
import { PriceCell } from "../molecules/price-cell";
import { NextBillingCell } from "../molecules/next-billing-cell";
import { StatusBadge } from "../atoms/status-badge";
import type { Subscription } from "@/services";
import { subscriptionService } from "@/services/subscription.service";
import { toast } from "sonner";
import { CreditCard, RefreshCw, XCircle } from "lucide-react";

interface SubscriptionsTableProps {
  initialSubscriptions: Subscription[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
}

export function SubscriptionsTable({
  initialSubscriptions,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
}: SubscriptionsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(
    initialSubscriptions,
  );
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState<string | null>(null);

  const urlSearch = searchParams.get("search") || "";
  const urlPage = searchParams.get("page")
    ? parseInt(searchParams.get("page")!, 10)
    : initialPage;
  const urlPageSize = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!, 10)
    : initialPageSize;

  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [pageSize, setPageSize] = useState(urlPageSize);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlPage = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : initialPage;
    const urlPageSize = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : initialPageSize;

    setSearchTerm(urlSearch);
    setCurrentPage(urlPage);
    setPageSize(urlPageSize);
  }, [searchParams, initialPage, initialPageSize]);

  useEffect(() => {
    setSubscriptions(initialSubscriptions);
    setTotal(initialTotal);
    setTotalPages(initialTotalPages);
  }, [initialSubscriptions, initialTotal, initialTotalPages]);

  const updateURL = useCallback(
    (updates: { page?: number; limit?: number; search?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.page !== undefined) {
        if (updates.page === 1) {
          params.delete("page");
        } else {
          params.set("page", updates.page.toString());
        }
      }

      if (updates.limit !== undefined) {
        if (updates.limit === 10) {
          params.delete("limit");
        } else {
          params.set("limit", updates.limit.toString());
        }
      }

      if (updates.search !== undefined) {
        if (updates.search === "") {
          params.delete("search");
        } else {
          params.set("search", updates.search);
        }
      }

      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await subscriptionService.getSubscriptions({
        page: currentPage,
        limit: pageSize,
      });

      if (!response.success) {
        toast.error(response.error || "Failed to load subscriptions");
        return;
      }

      if (response.data) {
        setSubscriptions(response.data.data || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotal(response.data.pagination.total);
        }
      }
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  const handleCancel = async (subscription: Subscription) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }

    setCanceling(subscription.id);
    try {
      const response = await subscriptionService.cancelSubscription(
        subscription.id,
        false,
      );

      if (response.success) {
        toast.success(
          "Subscription will be canceled at the end of the billing period",
        );
        loadSubscriptions();
      } else {
        toast.error(response.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("Something went wrong");
    } finally {
      setCanceling(null);
    }
  };

  const handleReactivate = async (subscription: Subscription) => {
    setCanceling(subscription.id);
    try {
      const response = await subscriptionService.reactivateSubscription(
        subscription.id,
      );

      if (response.success) {
        toast.success("Subscription reactivated successfully");
        loadSubscriptions();
      } else {
        toast.error(response.error || "Failed to reactivate subscription");
      }
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      toast.error("Something went wrong");
    } finally {
      setCanceling(null);
    }
  };

  const filteredSubscriptions = useMemo(() => {
    if (!searchTerm) return subscriptions;
    const term = searchTerm.toLowerCase();
    return subscriptions.filter(
      (sub) =>
        sub.id.toLowerCase().includes(term) ||
        sub.product?.name?.toLowerCase().includes(term) ||
        sub.status.toLowerCase().includes(term) ||
        sub.user?.email?.toLowerCase().includes(term),
    );
  }, [subscriptions, searchTerm]);

  const columns: Column<Subscription>[] = useMemo(
    () => [
      {
        key: "subscription",
        header: "Subscription",
        cell: (subscription) => (
          <SubscriptionCell subscription={subscription} />
        ),
      },
      {
        key: "customer",
        header: "Customer",
        cell: (subscription) => <CustomerCell subscription={subscription} />,
      },
      {
        key: "price",
        header: "Price",
        cell: (subscription) => <PriceCell subscription={subscription} />,
      },
      {
        key: "status",
        header: "Status",
        cell: (subscription) => <StatusBadge status={subscription.status} />,
      },
      {
        key: "nextBilling",
        header: "Next Billing",
        cell: (subscription) => (
          <NextBillingCell subscription={subscription} />
        ),
      },
    ],
    [],
  );

  const actions: DataTableAction<Subscription>[] = useMemo(
    () => [
      {
        label: (subscription) =>
          subscription.cancelAtPeriodEnd
            ? "Reactivate Subscription"
            : "Cancel Subscription",
        icon: (subscription) =>
          subscription.cancelAtPeriodEnd ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          ),
        onClick: (subscription) =>
          subscription.cancelAtPeriodEnd
            ? handleReactivate(subscription)
            : handleCancel(subscription),
        disabled: (sub) => canceling === sub.id,
      },
    ],
    [canceling],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscriptions</CardTitle>
        <CardDescription>
          {total} subscription{total === 1 ? "" : "s"} total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={filteredSubscriptions}
          columns={columns}
          actions={actions}
          loading={loading}
          loadingText="Loading subscriptions..."
          emptyIcon={<CreditCard className="h-8 w-8 text-gray-400" />}
          emptyTitle="No subscriptions found"
          emptyDescription="Subscriptions will appear here once they are created."
          searchable
          searchPlaceholder="Search by subscription, product, customer or status..."
          searchValue={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
            updateURL({ search: value, page: 1 });
          }}
          pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={(page) => {
            setCurrentPage(page);
            updateURL({ page });
          }}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
            updateURL({ limit: size, page: 1 });
          }}
          getRowId={(subscription) => subscription.id}
          onRefresh={loadSubscriptions}
        />
      </CardContent>
    </Card>
  );
}
