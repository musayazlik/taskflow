"use client";

import { Iconify } from "@/components/iconify";
import { motion } from "framer-motion";
import downloadIcon from "@iconify-icons/lucide/download";
import settingsIcon from "@iconify-icons/lucide/settings";
import rocketIcon from "@iconify-icons/lucide/rocket";
import checkIcon from "@iconify-icons/lucide/check";

const steps = [
  {
    number: "01",
    title: "Clone & Install",
    description:
      "Clone the repository and install dependencies with a single command. Everything is pre-configured.",
    icon: downloadIcon,
    checks: ["Git clone", "bun install", "Environment setup"],
  },
  {
    number: "02",
    title: "Configure",
    description:
      "Set up your environment variables and database. Prisma schema is ready to go.",
    icon: settingsIcon,
    checks: ["Database connection", "API keys", "Email config"],
  },
  {
    number: "03",
    title: "Ship",
    description:
      "Start the dev server and begin building your product. Deploy to Vercel, Railway, or Docker.",
    icon: rocketIcon,
    checks: ["bun run dev", "Production build", "Deploy anywhere"],
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-muted/20">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Iconify icon={rocketIcon} className="w-4 h-4" />
              Quick Start
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              From zero to{" "}
              <span className="bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                production
              </span>{" "}
              in minutes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No complex setup. No configuration hell. Just clone, configure,
              and start building.
            </p>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-linear-to-r from-primary/50 to-transparent" />
              )}

              <div className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
                {/* Step Number */}
                <div className="absolute -top-4 -left-2 w-12 h-12 rounded-xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 mt-4">
                  <Iconify icon={step.icon} className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground mb-6">{step.description}</p>

                {/* Checklist */}
                <ul className="space-y-3">
                  {step.checks.map((check) => (
                    <li key={check} className="flex items-center gap-2">
                      <Iconify
                        icon={checkIcon}
                        className="w-4 h-4 text-green-500"
                      />
                      <span className="text-sm text-muted-foreground">
                        {check}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Code Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="rounded-2xl overflow-hidden border border-border bg-[#0d1117] shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-xs text-muted-foreground font-mono ml-2">
                terminal
              </span>
            </div>
            <div className="p-6 font-mono text-sm">
              <div className="text-green-400">
                $ git clone https://github.com/turbostack/turbostack.git
              </div>
              <div className="text-muted-foreground mt-2">
                Cloning into 'turbostack'...
              </div>
              <div className="text-green-400 mt-4">
                $ cd turbostack && bun install
              </div>
              <div className="text-muted-foreground mt-2">
                ✓ Installed 127 packages
              </div>
              <div className="text-green-400 mt-4">$ bun run dev</div>
              <div className="text-muted-foreground mt-2">
                <div>➜ Web: http://localhost:4100</div>
                <div>➜ API: http://localhost:4101</div>
              </div>
              <div className="text-green-400 mt-4">
                ✓ Ready! Start building your next great app.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
