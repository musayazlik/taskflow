"use client";

import { Iconify } from "@/components/iconify";
import { Marquee } from "@/components/marquee";

const logos = [
  { name: "Next.js", icon: "logos:nextjs-icon" },
  { name: "TypeScript", icon: "logos:typescript-icon" },
  { name: "Prisma", icon: "material-icon-theme:prisma" },
  { name: "Tailwind", icon: "logos:tailwindcss-icon" },
  { name: "PostgreSQL", icon: "logos:postgresql" },
  { name: "Docker", icon: "logos:docker-icon" },
  { name: "Redis", icon: "logos:redis" },
  { name: "GitHub", icon: "logos:github-icon" },
  { name: "Elysia", icon: "simple-icons:elysia" },
  { name: "Bun", icon: "simple-icons:bun" },
];

export function LogoCloud() {
  return (
    <section className="py-16 border-y border-border/50 bg-muted/20 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 mb-8">
        <p className="text-center text-sm text-muted-foreground uppercase tracking-wider font-medium">
          Powered by industry-leading technologies
        </p>
      </div>

      {/* First Marquee Row */}
      <Marquee pauseOnHover className="[--duration:30s]">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="flex items-center gap-3 px-6 py-3 mx-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all group"
          >
            <Iconify
              icon={logo.icon}
              className="w-6 h-6 opacity-60 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {logo.name}
            </span>
          </div>
        ))}
      </Marquee>

      {/* Second Marquee Row - Reverse */}
      <Marquee reverse pauseOnHover className="[--duration:35s] mt-4">
        {[...logos].reverse().map((logo) => (
          <div
            key={`reverse-${logo.name}`}
            className="flex items-center gap-3 px-6 py-3 mx-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all group"
          >
            <Iconify
              icon={logo.icon}
              className="w-6 h-6 opacity-60 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {logo.name}
            </span>
          </div>
        ))}
      </Marquee>

      {/* Gradient Overlays */}
      <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-muted/20 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-muted/20 to-transparent pointer-events-none z-10" />
    </section>
  );
}
