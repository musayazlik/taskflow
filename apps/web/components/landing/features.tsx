"use client";

import { Iconify } from "@/components/iconify";
import { motion } from "framer-motion";
import zapIcon from "@iconify-icons/lucide/zap";
import shieldIcon from "@iconify-icons/lucide/shield";
import layersIcon from "@iconify-icons/lucide/layers";
import refreshCwIcon from "@iconify-icons/lucide/refresh-cw";
import code2Icon from "@iconify-icons/lucide/code-2";
import rocketIcon from "@iconify-icons/lucide/rocket";
import botIcon from "@iconify-icons/lucide/bot";
import creditCardIcon from "@iconify-icons/lucide/credit-card";
import mailIcon from "@iconify-icons/lucide/mail";
import { CardSpotlight } from "@/components/card-spotlight";

const features = [
  {
    icon: zapIcon,
    title: "Lightning Fast DX",
    description:
      "Hot reload, instant feedback, and optimized builds with Turborepo caching for rapid development.",
  },
  {
    icon: shieldIcon,
    title: "Type-Safe End-to-End",
    description:
      "Full TypeScript support from frontend to backend with shared types across the entire stack.",
  },
  {
    icon: layersIcon,
    title: "Monorepo Architecture",
    description:
      "Shared packages for database, validations, types, and UI components. One codebase to rule them all.",
  },
  {
    icon: botIcon,
    title: "AI Integration Ready",
    description:
      "Built-in OpenRouter integration for AI features. Add chat, content generation, or image processing.",
  },
  {
    icon: creditCardIcon,
    title: "Payments Built-in",
    description:
      "Polar.sh integration with webhooks, subscriptions, and checkout flows ready to monetize.",
  },
  {
    icon: mailIcon,
    title: "Email Infrastructure",
    description:
      "Resend integration with React Email templates for transactional and marketing emails.",
  },
  {
    icon: refreshCwIcon,
    title: "Auto API Documentation",
    description:
      "Elysia.js backend with auto-generated OpenAPI/Swagger docs. Your API documents itself.",
  },
  {
    icon: rocketIcon,
    title: "Production Ready",
    description:
      "Best practices, rate limiting, error handling, and security headers included from day one.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
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
              <Iconify icon={code2Icon} className="w-4 h-4" />
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Everything you need to{" "}
              <span className="bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                ship faster
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete toolkit for building modern SaaS applications. No more
              piecing together different tools and services.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <CardSpotlight
                spotlightColor="rgba(139, 92, 246, 0.15)"
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Iconify
                    icon={feature.icon}
                    className="w-6 h-6 text-primary"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardSpotlight>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
