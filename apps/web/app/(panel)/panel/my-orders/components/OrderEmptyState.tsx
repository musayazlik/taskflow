import Link from "next/link";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@repo/shadcn-ui/card";
import { Button } from "@repo/shadcn-ui/button";

interface OrderEmptyStateProps {
  searchQuery: string;
}

export function OrderEmptyState({ searchQuery }: OrderEmptyStateProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
      <CardContent className="p-12 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 mx-auto mb-4">
          <ShoppingBag className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No orders found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {searchQuery
            ? "No orders match your search criteria"
            : "You haven't placed any orders yet"}
        </p>
        <Link href="/panel/subscriptions">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Browse Products
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
