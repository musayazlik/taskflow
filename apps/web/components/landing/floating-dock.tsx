"use client";

import { Dock, DockIcon } from "@/components/dock";
import { Iconify } from "@/components/iconify";
import { LANDING_FLOATING_DOCK_ITEMS } from "@/constant/landing-content";

export function FloatingDock() {
  const handleClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <Dock direction="middle" distance={120}>
        {LANDING_FLOATING_DOCK_ITEMS.map((item) => (
          <DockIcon
            key={item.label}
            onClick={() => handleClick(item.href)}
            className="group relative"
          >
            <Iconify icon={item.icon} className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            {/* Tooltip */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-card border border-border text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {item.label}
            </span>
          </DockIcon>
        ))}
      </Dock>
    </div>
  );
}
