# Email Template Guidelines

This document explains the design standards, component structure, and delivery service integration of email templates created using React Email.

## 🎯 Overview

TurboStack uses **React Email** for all email templates. Email templates should be:

- Written as React components using **@react-email/components**
- Type-safe with TypeScript interfaces
- Consistent in design and branding
- Easy to preview and test

**Location**: `apps/api/src/emails/`

---

## 📁 File Structure

```
apps/api/src/emails/
├── verification-email.tsx      # Email verification template
├── password-reset-email.tsx    # Password reset template
└── welcome-email.tsx           # Welcome/activation template
```

Each template file should:

- Export a typed React component
- Include inline styles (email clients require inline styles)
- Have a default export for easy importing

---

## 🎨 Template Pattern

### Basic Template Structure

```typescript
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TemplateNameEmailProps {
  userName: string;
  // Add other props as needed
}

export const TemplateNameEmail: React.FC<Readonly<TemplateNameEmailProps>> = ({
  userName,
}) => (
  <Html>
    <Head />
    <Preview>Preview text shown in email client</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Heading style={logo}>TurboStack</Heading>
        </Section>

        <Heading style={h1}>Email Heading</Heading>

        <Text style={text}>Hi {userName || "there"},</Text>

        <Text style={text}>
          Your email content here.
        </Text>

        <Section style={buttonSection}>
          <Button href="https://example.com" style={button}>
            Call to Action
          </Button>
        </Section>

        <Hr style={divider} />

        <Text style={footerSmall}>
          © {new Date().getFullYear()} TurboStack. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

// Inline styles below...
```

---

## 🎨 Design System

### Color Palette

```typescript
const colors = {
  // Primary
  slate900: "#0f172a", // Headers, logo
  slate600: "#525f7f", // Body text
  slate400: "#8898aa", // Footer text

  // Accent
  indigo500: "#6366f1", // Buttons, links

  // Backgrounds
  gray50: "#f6f9fc", // Email background
  white: "#ffffff", // Container background

  // Borders
  gray200: "#e6ebf1", // Dividers
};
```

### Typography

```typescript
const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',

  // Headings
  logo: { fontSize: "28px", fontWeight: "700" },
  h1: { fontSize: "24px", fontWeight: "600" },

  // Body
  text: { fontSize: "16px", lineHeight: "1.6" },
  footer: { fontSize: "14px", lineHeight: "1.5" },
  footerSmall: { fontSize: "12px", lineHeight: "1.5" },
};
```

### Spacing

```typescript
const spacing = {
  container: { padding: "40px 20px", maxWidth: "580px" },
  section: { margin: "32px 0" },
  text: { margin: "0 0 16px" },
};
```

---

## 🏗️ Component Guidelines

### Required Components

Every email template should include:

1. **Preview Text**: First line shown in email inbox

   ```typescript
   <Preview>Short, actionable preview text</Preview>
   ```

2. **Logo/Branding**: Consistent brand header

   ```typescript
   <Section style={logoSection}>
     <Heading style={logo}>TurboStack</Heading>
   </Section>
   ```

3. **Main Heading**: Clear email purpose

   ```typescript
   <Heading style={h1}>Verify your email address</Heading>
   ```

4. **Body Content**: User-friendly message

   ```typescript
   <Text style={text}>Hi {userName || "there"},</Text>
   <Text style={text}>Your message here.</Text>
   ```

5. **Call to Action** (if applicable): Clear button

   ```typescript
   <Section style={buttonSection}>
     <Button href={actionUrl} style={button}>
       Action Button
     </Button>
   </Section>
   ```

6. **Fallback Link**: Text link for accessibility

   ```typescript
   <Text style={footer}>
     If the button doesn't work, copy and paste this link:
   </Text>
   <Text style={link}>{actionUrl}</Text>
   ```

7. **Footer**: Legal/copyright info
   ```typescript
   <Text style={footerSmall}>
     © {new Date().getFullYear()} TurboStack. All rights reserved.
   </Text>
   ```

---

## 📝 Service Integration

### Email Service Pattern

```typescript
// services/email.service.ts
import * as React from "react";
import { Resend } from "resend";
import { VerificationEmail } from "@/emails/verification-email";

export async function sendVerificationEmail(params: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: params.email,
      subject: `Verify your email - ${APP_NAME}`,
      // ✅ Use React.createElement for .ts files
      react: React.createElement(VerificationEmail, {
        userName: params.name || "there",
        verificationUrl: params.url,
      }),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
```

### Why React.createElement?

Since `email.service.ts` is a `.ts` file (not `.tsx`):

- ❌ Cannot use JSX syntax: `<VerificationEmail />`
- ✅ Must use: `React.createElement(VerificationEmail, { props })`
- This maintains type safety while working in `.ts` files

---

## 🧪 Testing & Preview

### Local Testing

```bash
# Install React Email CLI (if needed)
bun add -g react-email

# Preview emails locally
cd apps/api
email dev
```

This opens a browser preview at `http://localhost:3000` where you can:

- See all email templates
- Test with different props
- View mobile/desktop renderings
- Copy HTML output

### Environment Variables

Required in `.env`:

```bash
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=noreply@yourdomain.com
APP_NAME=TurboStack
```

---

## ✅ Template Checklist

When creating a new email template:

- [ ] Create `.tsx` file in `apps/api/src/emails/`
- [ ] Define TypeScript interface for props
- [ ] Use `React.FC<Readonly<Props>>` for component type
- [ ] Include all required components (Preview, Logo, H1, Body, Footer)
- [ ] Follow design system colors and typography
- [ ] Test inline styles work in email clients
- [ ] Add fallback text link for buttons/CTAs
- [ ] Handle null/undefined props gracefully (e.g., `userName || "there"`)
- [ ] Export component as both named and default export
- [ ] Update `email.service.ts` to use new template
- [ ] Test email sending in development

---

## 📋 Common Patterns

### Action Button Email

For emails requiring user action (verification, password reset):

```typescript
<Section style={buttonSection}>
  <Button href={actionUrl} style={button}>
    Primary Action
  </Button>
</Section>

<Text style={text}>
  This link will expire in 24 hours.
</Text>

<Hr style={divider} />

<Text style={footer}>
  If the button doesn't work, copy this link:
</Text>
<Text style={link}>{actionUrl}</Text>
```

### Notification Email

For informational emails (welcome, confirmation):

```typescript
<Heading style={h1}>Welcome to TurboStack!</Heading>

<Text style={text}>Hi {userName},</Text>

<Text style={text}>
  Your account has been activated successfully.
</Text>

<Text style={text}>
  Thank you for joining us!
</Text>
```

### Transactional Email

For receipts, invoices, updates:

```typescript
<Heading style={h1}>Payment Received</Heading>

<Text style={text}>Hi {userName},</Text>

<Text style={text}>
  We've received your payment of ${amount}.
</Text>

<Section>
  {/* Transaction details table */}
</Section>
```

---

## 🚨 Common Mistakes to Avoid

### DON'T ❌

```typescript
// ❌ Don't use external stylesheets
<link rel="stylesheet" href="styles.css" />

// ❌ Don't use <img> without alt text
<img src="logo.png" />

// ❌ Don't assume props are always defined
<Text>{userName.toUpperCase()}</Text>

// ❌ Don't use complex CSS (flexbox, grid)
<div style={{ display: "flex" }}>

// ❌ Don't call component as function in .tsx files
react: VerificationEmail({ userName, url })
```

### DO ✅

```typescript
// ✅ Use inline styles
<div style={{ color: "#0f172a", fontSize: "16px" }}>

// ✅ Always provide alt text
<Img src="logo.png" alt="TurboStack Logo" />

// ✅ Handle undefined props
<Text>{userName || "there"}</Text>

// ✅ Use table-based layouts for email
<Section style={{ textAlign: "center" }}>

// ✅ Use React.createElement in .ts files
react: React.createElement(VerificationEmail, { userName, url })
```

---

## 📚 Resources

- [React Email Documentation](https://react.email/docs/introduction)
- [React Email Components](https://react.email/docs/components/html)
- [Resend Documentation](https://resend.com/docs/send-with-react)
- [Email Client CSS Support](https://www.campaignmonitor.com/css/)
