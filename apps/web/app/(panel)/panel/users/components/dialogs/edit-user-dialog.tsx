"use client";

import { useState, useId, useEffect } from "react";
import { Pencil, Crown, Shield, Loader2 } from "lucide-react";
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
import { userService, type User } from "@/services";
import { toast } from "sonner";

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "USER" as "USER" | "ADMIN",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameId = useId();
  const emailId = useId();
  const roleId = useId();

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role as "USER" | "ADMIN",
      });
      setFormErrors({});
    }
  }, [user]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email format";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = async () => {
    if (!user || !validateForm()) return;

    try {
      setIsSubmitting(true);
      const response = await userService.updateUser(user.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });

      if (response.success) {
        onOpenChange(false);
        toast.success("User updated successfully");
        onSuccess();
      } else {
        setFormErrors({ submit: response.message || "Failed to update user" });
      }
    } catch (error) {
      setFormErrors({ submit: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20">
              <Pencil className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-gray-900 dark:text-white">
                Edit User
              </DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">
                Update user information and permissions.
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
              onValueChange={(value: "USER" | "ADMIN") =>
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
              </SelectContent>
            </Select>
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
          <Button onClick={handleEdit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
