"use client";

import Link from "next/link";
import { Iconify } from "@/components/iconify";
import { motion } from "framer-motion";
import arrowRightIcon from "@iconify-icons/lucide/arrow-right";
import rocketIcon from "@iconify-icons/lucide/rocket";
import githubIcon from "@iconify-icons/lucide/github";

export function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-purple-600 to-primary p-px"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-purple-600/20 to-primary/20 blur-3xl" />

          <div className="relative rounded-3xl bg-card/95 backdrop-blur-sm p-8 md:p-16 text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-6">
              <Iconify icon={rocketIcon} className="w-8 h-8 text-white" />
            </div>

            {/* Content */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Ready to{" "}
              <span className="bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                keep every task on track
              </span>
              ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Create your first workspace in minutes and start collaborating with your team in Taskflow.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group flex items-center gap-2 px-8 py-4 rounded-full bg-linear-to-r from-primary to-purple-600 text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-105"
              >
                Get Started Free
                <Iconify
                  icon={arrowRightIcon}
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>

            {/* Trust Text */}
            <p className="mt-8 text-sm text-muted-foreground">
              No credit card required. Free forever plan available.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
