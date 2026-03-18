"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { Button } from "@repo/shadcn-ui/button";
import { Mail, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function ContactSupportCard() {
  return (
    <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Still need help?
        </CardTitle>
        <CardDescription>
          Our support team is here to assist you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? Contact our support
              team and we&apos;ll get back to you as soon as possible.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-muted-foreground">
                  Average response time: 2 hours
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">Available 24/7</span>
              </div>
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => toast.info("Opening support ticket...")}
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Support
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
