"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Loader2, Crown, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@repo/shadcn-ui/button";
import { Input } from "@repo/shadcn-ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@repo/shadcn-ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/shadcn-ui/form";
import { adminUserEditSchema, type AdminUserEditInput } from "@repo/validations/user";
import type { UserEditDialogRole } from "./user-create-dialog";

export interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: { name: string; email: string; role: UserEditDialogRole } | null;
  onSubmit: (values: AdminUserEditInput) => Promise<{ success: boolean; message?: string }>;
}

type AdminUserEditFormValues = z.input<typeof adminUserEditSchema>;

function DialogHeaderComponent({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20">
        <span className="text-blue-600 dark:text-blue-400">{icon}</span>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export function UserEditDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: UserEditDialogProps) {
  const form = useForm<AdminUserEditFormValues>({
    resolver: zodResolver(adminUserEditSchema),
    defaultValues: useMemo(
      () => ({
        name: defaultValues?.name ?? "",
        email: defaultValues?.email ?? "",
        role: defaultValues?.role ?? "USER",
      }),
      // defaultValues is reset via effect
      [],
    ),
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const disabled = form.formState.isSubmitting;

  useEffect(() => {
    if (!open) return;
    if (!defaultValues) return;
    setSubmitError(null);
    form.reset({
      name: defaultValues.name,
      email: defaultValues.email,
      role: defaultValues.role,
    });
  }, [open, defaultValues, form]);

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setSubmitError(null);
      form.reset();
    }
  };

  const handleValidSubmit = async (values: AdminUserEditFormValues) => {
    setSubmitError(null);
    const parsed = adminUserEditSchema.parse(values);
    const result = await onSubmit(parsed);
    if (result.success) {
      onOpenChange(false);
      return;
    }
    setSubmitError(result.message || "Failed to update user");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogHeaderComponent
            icon={<Pencil className="h-5 w-5" />}
            title="Edit User"
            description="Update user information and permissions."
          />
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleValidSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      disabled={disabled}
                      className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      disabled={disabled}
                      className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">
                    Role
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as UserEditDialogRole)}
                    disabled={disabled}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                      <SelectItem value="USER">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-500" />
                          User
                        </div>
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-amber-500" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError ? (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {submitError}
                </p>
              </div>
            ) : null}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={disabled}
                className="border-gray-200 dark:border-zinc-700"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={disabled}>
                {disabled ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
