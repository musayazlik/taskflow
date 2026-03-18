"use client";

import { useState } from "react";
import { Button } from "@repo/shadcn-ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface UrlCopyButtonProps {
  url: string;
}

export function UrlCopyButton({ url }: UrlCopyButtonProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("URL copied to clipboard!");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopyUrl}
      className="h-8 px-2"
    >
      {copiedUrl === url ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="ml-1 text-xs">Copy</span>
    </Button>
  );
}
