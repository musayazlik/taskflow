"use client";

import { useState, useId } from "react";
import {
  Plus,
  Crown,
  Shield,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@repo/shadcn-ui/button";
import { Input } from "@repo/shadcn-ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/shadcn-ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/select";
import { Label } from "@repo/shadcn-ui/label";
import { userService } from "@/services";
import { toast } from "sonner";

export interface UserFormData {
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  password: string;
}

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "USER",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

  const nameId = useId();
  const emailId = useId();
  const roleId = useId();
  const passwordId = useId();

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email format";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 8)
      errors.password = "Password must be at least 8 characters";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGeneratePassword = async () => {
    setIsGeneratingPassword(true);
    try {
      const response = await userService.generatePassword();
      if (response.success && response.data) {
        setFormData({ ...formData, password: response.data.password });
        setShowPassword(true);
      } else {
        toast.error("Failed to generate password");
      }
    } catch {
      toast.error("Failed to generate password");
    } finally {
      setIsGeneratingPassword(false);
    }
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const response = await userService.createUser(formData);

      if (response.success) {
        setFormData({ name: "", email: "", role: "USER", password: "" });
        setShowPassword(false);
        setFormErrors({});
        onOpenChange(false);
        toast.success(response.message || "User created successfully");
        onSuccess();
      } else {
        setFormErrors({ submit: response.message || "Failed to create user" });
      }
    } catch {
      setFormErrors({ submit: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", role: "USER", password: "" });
    setShowPassword(false);
    setFormErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-gray-900 dark:text-white">
                Create New User
              </DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">
                Add a new user to the system.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor={nameId}
              className="text-gray-700 dark:text-gray-300"
            >
              Full Name
            </Label>
            <Input
              id={nameId}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="John Doe"
              className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:border-primary"
            />
            {formErrors.name && (
              <p className="text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor={emailId}
              className="text-gray-700 dark:text-gray-300"
            >
              Email Address
            </Label>
            <Input
              id={emailId}
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="john@example.com"
              className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:border-primary"
            />
            {formErrors.email && (
              <p className="text-sm text-red-500">{formErrors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor={roleId}
              className="text-gray-700 dark:text-gray-300"
            >
              Role
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: "USER" | "ADMIN" | "SUPER_ADMIN") =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger
                id={roleId}
                className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
              >
                <SelectValue />
              </SelectTrigger>
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
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor={passwordId}
              className="text-gray-700 dark:text-gray-300"
            >
              Password
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter password or generate"
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                onClick={handleGeneratePassword}
                disabled={isGeneratingPassword}
                className="shrink-0 border-gray-200 dark:border-zinc-700"
              >
                {isGeneratingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            {formErrors.password && (
              <p className="text-sm text-red-500">{formErrors.password}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Minimum 8 characters. User will receive login credentials via
              email.
            </p>
          </div>

          {formErrors.submit && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900">
              <p className="text-sm text-red-600 dark:text-red-400">
                {formErrors.submit}
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-gray-200 dark:border-zinc-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isSubmitting}
            className="shadow-lg shadow-primary/25"
          >
            {isSubmitting ? (
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
      </DialogContent>
    </Dialog>
  );
}
