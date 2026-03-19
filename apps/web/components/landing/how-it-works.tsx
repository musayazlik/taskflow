"use client";

import { Iconify } from "@/components/iconify";
import { motion } from "framer-motion";
import rocketIcon from "@iconify-icons/lucide/rocket";
import checkIcon from "@iconify-icons/lucide/check";
import { LANDING_HOW_IT_WORKS_STEPS } from "@/constant/landing-content";

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
              From idea to{" "}
              <span className="bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                done
              </span>{" "}
              in minutes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No complex setup or onboarding playbooks. Create a workspace, add tasks, and see work move forward in real time.
            </p>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {LANDING_HOW_IT_WORKS_STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connection Line */}
              {index < LANDING_HOW_IT_WORKS_STEPS.length - 1 && (
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
                activity
              </span>
            </div>
            <div className="p-6 font-mono text-sm text-muted-foreground space-y-2">
              <div className="text-green-400">
                [10:02] You created workspace <span className="text-white">Product Team</span>
              </div>
              <div>[10:05] You added 12 tasks to <span className="text-white">Q2 Launch</span></div>
              <div>[10:08] Alex moved <span className="text-white">Design login flow</span> → In Progress</div>
              <div>[10:15] Maria completed <span className="text-white">Set up notifications</span></div>
              <div className="text-green-400 mt-4">
                ✓ Everyone is aligned. Nothing falls through the cracks.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
