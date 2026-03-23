"use client";

import { Iconify } from "@/components/iconify";
import { motion } from "framer-motion";
import code2Icon from "@iconify-icons/lucide/code-2";
import { CardSpotlight } from "@/components/card-spotlight";
import { LANDING_FEATURES } from "@/constant/landing-content";

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
                manage work together
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              TaskFlow keeps tasks, owners, and context in one place so teams can move quickly without losing clarity.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {LANDING_FEATURES.map((feature, index) => (
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
