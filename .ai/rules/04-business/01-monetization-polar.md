# Monetization with Polar.sh

> Webhook management, subscriptions, payment flows

## 🔗 Polar API Integration

```typescript
const POLAR_API_BASE = {
  sandbox: "https://api.polar.sh/v1",
  production: "https://api.polar.sh/v1",
};

async function polarRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = POLAR_API_BASE[env.POLAR_ENVIRONMENT || "sandbox"];
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new AppError("POLAR_API_ERROR", error, response.status);
  }

  return response.json();
}
```

## 🔄 Webhook Handler

```typescript
// routes/polar-webhook.ts
import crypto from "crypto";

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = env.POLAR_WEBHOOK_SECRET;
  if (!secret) return false;
  
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export const polarWebhookRoutes = new Elysia({ prefix: "/webhooks/polar" })
  .post("/", async ({ body, request }) => {
    const signature = request.headers.get("polar-signature") || "";
    
    if (env.NODE_ENV === "production" && !verifyWebhookSignature(JSON.stringify(body), signature)) {
      throw new AppError("WEBHOOK_INVALID_SIGNATURE", "Invalid signature", 401);
    }

    switch (body.type) {
      case "order.created":
        await handleOrderCreated(body.data);
        break;
      case "subscription.created":
      case "subscription.updated":
        await handleSubscriptionUpdate(body.data);
        break;
    }

    return { received: true };
  });
```

## 💳 Subscription Control

```typescript
export async function requireActiveSubscription(userId: string, productSlug?: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
      currentPeriodEnd: { gt: new Date() },
      ...(productSlug && { product: { slug: productSlug } }),
    },
  });

  if (!subscription) {
    throw new AppError("SUBSCRIPTION_REQUIRED", "Active subscription required", 403);
  }

  return subscription;
}
```

## 🤖 AI MUST Rules

1. **Verify webhook signatures** - In production
2. **Use timing-safe comparison** - `crypto.timingSafeEqual()`
3. **Handle all webhook types** - product, order, subscription
4. **Sync local database** - With Polar's state
5. **Use AppError** - Consistent errors
6. **Check environment** - sandbox vs production
