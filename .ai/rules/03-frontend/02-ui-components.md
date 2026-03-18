# UI Components

> Tailwind CSS v4, Iconify icons, accessibility patterns

## 🎨 Tailwind CSS v4

### Theme Variables
```css
@theme {
  --color-primary: #6366f1;
  --color-success: #10b981;
  --color-error: #ef4444;
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --radius-md: 0.5rem;
}
```

### Using Theme Variables
```tsx
// ✅ Good
<button className="bg-primary hover:bg-primary-hover text-white px-md py-sm rounded-md">
  Click me
</button>
```

## 🔣 Iconify Icons

```tsx
import { Iconify } from "@/components/iconify";

// Basic usage
<Iconify icon="mdi:home" />

// With sizing and color
<Iconify icon="mdi:check-circle" className="w-6 h-6 text-success" />

// In buttons
<button className="flex items-center gap-2">
  <Iconify icon="mdi:plus" />
  Add User
</button>
```

## 🧩 shadcn/ui Components

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Button variants
<Button variant="default">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Danger</Button>
<Button variant="ghost">Ghost</Button>
```

## ♿ Accessibility

### ARIA Attributes
```tsx
<button
  aria-label="Close dialog"
  aria-pressed={isOpen}
  aria-expanded={isOpen}
>
  <Iconify icon="mdi:close" />
</button>

// Form inputs
<label htmlFor="email" className="sr-only">Email</label>
<input
  id="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
```

### Screen Reader Support
```tsx
// Hide decorative icons
<Iconify icon="mdi:decoration" aria-hidden="true" />

// Provide text alternatives
<button>
  <Iconify icon="mdi:delete" aria-hidden="true" />
  <span className="sr-only">Delete item</span>
</button>
```

## 🎭 Dark Mode
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <h1 className="text-2xl font-bold">Title</h1>
  <p className="text-gray-600 dark:text-gray-400">Content</p>
</div>
```

## 🤖 AI MUST Rules

1. **Use theme variables** - Never hardcode colors
2. **Use Iconify for icons** - SSR-safe component
3. **Apply dark mode classes** - dark: prefix
4. **Include ARIA attributes** - For accessibility
5. **Use shadcn/ui patterns** - Consistent structure
6. **Add focus indicators** - focus:ring classes
7. **Hide decorative icons** - aria-hidden="true"
