"use client";

import { Iconify } from "@/components/iconify";
import { motion } from "framer-motion";
import clockIcon from "@iconify-icons/lucide/clock";
import codeIcon from "@iconify-icons/lucide/code";
import usersIcon from "@iconify-icons/lucide/users";
import zapIcon from "@iconify-icons/lucide/zap";

const stats = [
  {
    icon: clockIcon,
    value: "100+",
    label: "Hours Saved",
    description: "On initial setup and configuration",
  },
  {
    icon: codeIcon,
    value: "100%",
    label: "TypeScript",
    description: "End-to-end type safety",
  },
  {
    icon: usersIcon,
    value: "500+",
    label: "Developers",
    description: "Already shipping faster",
  },
  {
    icon: zapIcon,
    value: "5min",
    label: "Setup Time",
    description: "From clone to running",
  },
];

export function Stats() {
  return (
    <section className="py-20 px-6 bg-linear-to-b from-background to-muted/30">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Iconify icon={stat.icon} className="w-6 h-6 text-primary" />
              </div>
              <div className="text-4xl md:text-5xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
