# resend

**Resend** integration for transactional email. Exposes a lazy `Resend` client, default `FROM_EMAIL`, and **`sendEmail`** used by `src/emails` templates (verification, password reset, welcome, etc.).

## What it does

- **`resend`**: `Resend` instance when `env.RESEND_API_KEY` is set; otherwise `null`.

- **`FROM_EMAIL`**: `env.FROM_EMAIL` or Resend’s default onboarding sender — ensure your domain is verified in Resend for production.

- **`isEmailConfigured()`**: quick check before attempting sends in optional features.

- **`sendEmail(options)`**:
  - **`to`**: string or array of recipients.
  - **`subject`**, **`html`**, **`text`** — at least one body variant should be set for real delivery.
  - **`replyTo`**: optional.

- **Development without API key**: does **not** call Resend; logs a structured preview via [`../logger`](../logger/README.md) and returns a fake id (`dev-<timestamp>`). This keeps local dev unblocked without burning API quota.

## Usage

```ts
import { sendEmail, FROM_EMAIL, isEmailConfigured } from "@api/lib/resend";

if (!isEmailConfigured()) {
  // optional: skip or warn
}

await sendEmail({
  to: "user@example.com",
  subject: "Hello",
  html: "<p>Hi</p>",
});
```

## Environment

See [`../env`](../env/README.md): `RESEND_API_KEY`, `FROM_EMAIL` (optional but recommended).

## Related

- [`../../emails`](../../emails) — higher-level template functions that call `sendEmail`.
