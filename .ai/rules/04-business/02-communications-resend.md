# Communications with Resend

> React Email templates, Resend sending logic

## 🔗 Resend Setup

```typescript
// lib/resend.ts
import { Resend } from "resend";

export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
export const FROM_EMAIL = env.FROM_EMAIL || "onboarding@resend.dev";

export const isEmailConfigured = (): boolean => resend !== null;

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}) {
  const recipients = Array.isArray(options.to) ? options.to : [options.to];

  // Development: Log to console
  if (!resend) {
    console.log("📧 EMAIL (Dev Mode):", options.subject, "to:", recipients);
    return { id: `dev-${Date.now()}` };
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: recipients,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  if (error) throw new Error(`Failed to send: ${error.message}`);
  return data;
}
```

## 🎨 React Email Template

```tsx
// emails/verification-email.tsx
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

interface Props {
  url: string;
  userName?: string;
}

export function VerificationEmail({ url, userName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ backgroundColor: "#fff", padding: "40px" }}>
          <Heading>Verify Your Email</Heading>
          <Text>Hi {userName || "there"},</Text>
          <Text>Please verify your email:</Text>
          <Section>
            <Button href={url} style={{ backgroundColor: "#6366f1", color: "#fff", padding: "12px 24px" }}>
              Verify Email
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

## 📤 Sending Function

```typescript
// emails/index.ts
import { render } from "@react-email/render";
import { VerificationEmail } from "./verification-email";

export async function sendVerificationEmail({ to, url, userName }) {
  const html = await render(VerificationEmail({ url, userName }));
  
  return sendEmail({
    to,
    subject: "Verify your email address",
    html,
    text: `Verify: ${url}`,
  });
}
```

## 🤖 AI MUST Rules

1. **Use React Email** - Type-safe templates
2. **Inline all styles** - No external CSS
3. **Include text version** - For accessibility
4. **Render before sending** - @react-email/render
5. **Log in development** - When no API key
6. **Add Preview text** - For email clients
