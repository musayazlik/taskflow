import {
  LayoutDashboard,
  Users,
  Settings,
  User,
  Bell,
  ListTodo,
} from "lucide-react";

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface SubMenuItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
}

export interface MenuItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  href?: string;
  roles?: UserRole[];
  badge?: string;
  subItems?: SubMenuItem[];
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

/** Filter menu sections by user role. SUPER_ADMIN sees ADMIN items too. */
export function filterMenuByRole(
  sections: MenuSection[],
  userRole: UserRole,
): MenuSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          !item.roles?.length ||
          item.roles.includes(userRole) ||
          (userRole === "SUPER_ADMIN" && item.roles.includes("ADMIN")),
      ),
    }))
    .filter((section) => section.items.length > 0);
}

/** Get labels of submenus that should be open based on current path. */
export function getInitialOpenSubmenus(
  sections: MenuSection[],
  pathname: string,
): string[] {
  const open: string[] = [];
  for (const section of sections) {
    for (const item of section.items) {
      if (item.subItems?.some((sub) => pathname.startsWith(sub.href))) {
        open.push(item.label);
      }
    }
  }
  return open;
}

export const menuItems: MenuSection[] = [
  {
    title: "Main",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/panel/dashboard",
        roles: ["USER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: ListTodo,
        label: "Tasks",
        href: "/panel/tasks",
        roles: ["USER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: User,
        label: "Profile",
        href: "/panel/profile",
        roles: ["USER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: Bell,
        label: "Notifications",
        href: "/panel/notifications",
        roles: ["USER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: Settings,
        label: "Settings",
        href: "/panel/settings",
        roles: ["USER", "ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        icon: Users,
        label: "Users",
        href: "/panel/users",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
];
