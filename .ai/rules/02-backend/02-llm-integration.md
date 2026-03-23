# LLM Integration

> OpenRouter model calling, streaming responses, error handling

## 🔗 OpenRouter Setup

```typescript
const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

async function chatCompletion(params: {
  model: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}) {
  const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.FRONTEND_URL,
      "X-Title": "TaskFlow",
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 2048,
      stream: params.stream ?? false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AppError("OPENROUTER_ERROR", error?.error?.message, 500);
  }

  return response.json();
}
```

## 🌊 Streaming Response

```typescript
.post("/chat/stream", async function* ({ body }) {
  const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${env.OPENROUTER_API_KEY}` },
    body: JSON.stringify({ ...body, stream: true }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        
        const parsed = JSON.parse(data);
        const content = parsed.choices[0]?.delta?.content;
        if (content) yield content;
      }
    }
  }
});
```

## ⚠️ Error Handling

```typescript
// Common Error Codes
| Code                      | HTTP | Description           |
|---------------------------|------|----------------------|
| OPENROUTER_NOT_CONFIGURED | 500  | API key missing      |
| OPENROUTER_ERROR          | 500  | Generic API error    |
| NETWORK_ERROR             | 503  | Connection failed    |
| RATE_LIMITED              | 429  | Too many requests    |
| INVALID_MODEL             | 400  | Model not available  |
```

## 🤖 AI MUST Rules

1. **Check API key exists** - Before making requests
2. **Include proper headers** - Authorization, HTTP-Referer, X-Title
3. **Handle streaming properly** - Use generators
4. **Implement rate limit handling** - 429 status codes
5. **Use AppError** - Consistent error handling
