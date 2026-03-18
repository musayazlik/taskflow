# Form Validation

> React Hook Form with Zod/TypeBox bridge

## 🔗 Zod + React Hook Form

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 1. Define schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  // 2. Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  // 3. Submit handler
  const onSubmit = async (data: FormData) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Sign In
        </Button>
      </form>
    </Form>
  );
}
```

## 📋 Array Fields

```tsx
const formSchema = z.object({
  items: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    quantity: z.number().min(1),
  })).min(1, "At least one item required"),
});

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "items",
});
```

## 🔗 Server Actions Integration

```tsx
"use client";

import { createUser } from "@/lib/actions/user";
import { useToast } from "@/components/ui/use-toast";

export function CreateUserForm() {
  const { toast } = useToast();
  const form = useForm<FormData>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createUser(data);
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: "Success", description: "User created" });
      form.reset();
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  };

  return <Form>...</Form>;
}
```

## 🤖 AI MUST Rules

1. **Use React Hook Form** - With Zod resolver
2. **Define Zod schemas** - In `@repo/validations`
3. **Infer types from schemas** - `z.infer<typeof schema>`
4. **Use shadcn/ui Form** - Form, FormField, FormItem
5. **Include defaultValues** - For all fields
6. **Handle loading states** - Disable submit during submission
7. **Show toasts** - After submission
8. **Reset form on success**
