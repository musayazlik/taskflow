"use client";

import { useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  Crown,
  Shield,
  ShieldCheck,
} from "lucide-react";
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
import { toast } from "sonner";
import { userCreateSchema, type UserCreateInput } from "@repo/validations/user";
import type { Role } from "@repo/types";
import { userService } from "@/services";

export type UserEditDialogRole = "USER" | "ADMIN";

// ============ Create Dialog ============
export interface UserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserCreateInput) => Promise<{ success: boolean; message?: string }>;
}

type UserCreateFormValues = z.input<typeof userCreateSchema>;

export function UserCreateDialog({
  open,
  onOpenChange,
  onSubmit,
}: UserCreateDialogProps) {
  function PasswordField(props: {
    value: string;
    onChange: (value: string) => void;
    onGeneratePassword: () => Promise<void>;
    generating: boolean;
    disabled: boolean;
  }) {
    const [showPassword, setShowPassword] = useState(false);
    const passwordId = useId();

    return (
      <div className="space-y-2">
        <FormLabel
          htmlFor={passwordId}
          className="text-gray-700 dark:text-gray-300"
        >
          Password
        </FormLabel>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              value={props.value}
              onChange={(e) => props.onChange(e.target.value)}
              placeholder="Enter password or generate"
              disabled={props.disabled}
              className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:border-primary pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={props.disabled}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void props.onGeneratePassword()}
            disabled={props.disabled || props.generating}
            className="shrink-0 border-gray-200 dark:border-zinc-700"
          >
            {props.generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Minimum 6 characters. User will receive login credentials via email.
        </p>
      </div>
    );
  }

  const form = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: useMemo(
      () => ({
        name: "",
        email: "",
        role: "USER",
        password: "",
      }),
      [],
    ),
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [generatingPassword, setGeneratingPassword] = useState(false);

  const disabled = form.formState.isSubmitting;

  const handleGeneratePassword = async () => {
    setGeneratingPassword(true);
    try {
      const response = await userService.generatePassword();
      if (!response.success || !response.data?.password) {
        toast.error(response.message || "Failed to generate password");
        return;
      }
      form.setValue("password", response.data.password, { shouldValidate: true });
    } catch {
      toast.error("Failed to generate password");
    } finally {
      setGeneratingPassword(false);
    }
  };

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setSubmitError(null);
      form.reset();
    }
  };

  const handleValidSubmit = async (values: UserCreateFormValues) => {
    setSubmitError(null);
    const parsed = userCreateSchema.parse(values);
    const result = await onSubmit(parsed);
    if (result.success) {
      form.reset();
      onOpenChange(false);
      return;
    }
    setSubmitError(result.message || "Failed to create user");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20">
              <span className="text-primary">
                <Plus className="h-5 w-5" />
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New User
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add a new user to the system.
              </p>
            </div>
          </div>
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
                    onValueChange={(v) => field.onChange(v as Role)}
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
                      <SelectItem value="SUPER_ADMIN">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-purple-500" />
                          Super Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <PasswordField
                    value={field.value}
                    onChange={field.onChange}
                    onGeneratePassword={handleGeneratePassword}
                    generating={generatingPassword}
                    disabled={disabled}
                  />
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
              <Button
                type="submit"
                disabled={disabled}
                className="shadow-lg shadow-primary/25"
              >
                {disabled ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
