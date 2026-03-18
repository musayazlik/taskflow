export { Sidebar, SidebarSkeleton } from "./sidebar";
export { MobileSidebar } from "./mobile-sidebar";
export { Header } from "./header";
export { PanelShell } from "./panel-shell";
export { PanelFooter } from "./footer";
export { PageHeader } from "./page-header";
export type { PageHeaderProps, PageHeaderAction, PageHeaderBadge } from "./page-header";

// Re-export with Panel prefix to avoid conflicts
export { Sidebar as PanelSidebar } from "./sidebar";
export { Header as PanelHeader } from "./header";
