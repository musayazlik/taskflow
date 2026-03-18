import {
  LayoutDashboard,
  Users,
  Settings,
  Image,
  ShoppingCart,
  CreditCard,
  UserCircle,
  User,
  BarChart3,
  HelpCircle,
  Bell,
  Ticket,
  Brain,
  MessageSquare,
  FileEdit,
  ImageIcon,
  Search,
  Package,
  Receipt,
  Shield,
  Mail,
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
        icon: BarChart3,
        label: "Usage",
        href: "/panel/usage",
        roles: ["USER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: Ticket,
        label: "Tickets",
        href: "/panel/tickets",
        roles: ["USER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: MessageSquare,
        label: "Messages",
        href: "/panel/messages",
        roles: ["USER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: ShoppingCart,
        label: "My Orders",
        href: "/panel/my-orders",
        roles: ["USER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: Brain,
        label: "AI Tools",
        href: "/panel/ai-models",
        roles: ["USER", "ADMIN", "SUPER_ADMIN"],
        badge: "New",
        subItems: [
          {
            icon: Brain,
            label: "Models",
            href: "/panel/ai-models",
          },
          {
            icon: MessageSquare,
            label: "Chat",
            href: "/panel/ai-models/chat",
          },
          {
            icon: FileEdit,
            label: "Content Writer",
            href: "/panel/ai-models/content",
          },
          {
            icon: ImageIcon,
            label: "Image Generator",
            href: "/panel/ai-models/image",
          },
          {
            icon: Search,
            label: "SEO Optimizer",
            href: "/panel/ai-models/seo",
          },
        ],
      },
      {
        icon: HelpCircle,
        label: "Help",
        href: "/panel/help",
        roles: ["USER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: Settings,
        label: "Settings",
        href: "/panel/settings",
        roles: ["USER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: Shield,
        label: "Security",
        href: "/panel/security",
        roles: ["USER", "ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: UserCircle,
        label: "Account Settings",
        href: "/panel/account-settings",
        roles: ["USER", "ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        icon: Image,
        label: "Media",
        href: "/panel/media",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: Users,
        label: "Users",
        href: "/panel/users",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: UserCircle,
        label: "Customers",
        href: "/panel/customers",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: Package,
        label: "Products",
        href: "/panel/products",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: ShoppingCart,
        label: "Orders",
        href: "/panel/orders",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: CreditCard,
        label: "Subscriptions",
        href: "/panel/subscriptions",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        icon: Receipt,
        label: "Invoices",
        href: "/panel/invoices",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
];
