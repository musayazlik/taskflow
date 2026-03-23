import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@repo/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<LoadingState />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}

function LoadingState() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Processing...</CardTitle>
        <CardDescription>
          Please wait while we confirm your subscription
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function SuccessContent() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl">Subscription Successful! 🎉</CardTitle>
        <CardDescription>
          Thank you for subscribing to TaskFlow. Your account has been
          upgraded.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <h3 className="font-semibold">What's Next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Access your AI rules and guidelines</li>
            <li>• Download the TaskFlow starter template</li>
            <li>• Join our community Discord</li>
            <li>• Check your email for getting started guide</li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button asChild className="flex-1">
          <a href="/panel">Go to Dashboard</a>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <a href="/docs">View Docs</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
