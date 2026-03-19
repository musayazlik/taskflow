"use client";

import Link from "next/link";
import { Iconify } from "@/components/iconify";
import { motion } from "framer-motion";
import checkIcon from "@iconify-icons/lucide/check";
import starIcon from "@iconify-icons/lucide/star";
import { LANDING_PRICING_PLANS } from "@/constant/landing-content";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-muted/20">
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
              <Iconify icon={starIcon} className="w-4 h-4" />
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Simple,{" "}
              <span className="bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                transparent
              </span>{" "}
              pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start for free, upgrade when you're ready. No hidden fees, no
              surprises.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {LANDING_PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative flex flex-col p-8 rounded-2xl ${
                plan.popular
                  ? "bg-linear-to-b from-primary/10 to-purple-600/5 border-2 border-primary"
                  : "bg-card border border-border hover:border-primary/30"
              } transition-all`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-linear-to-r from-primary to-purple-600 text-white text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Iconify icon={plan.icon} className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {plan.originalPrice}
                    </span>
                  )}
                </div>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Iconify
                      icon={checkIcon}
                      className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
                    />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`block text-center py-3 px-6 rounded-full font-semibold transition-all ${
                  plan.popular
                    ? "bg-linear-to-r from-primary to-purple-600 text-white hover:opacity-90"
                    : "bg-card border-2 border-border hover:border-primary/50"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Iconify icon={checkIcon} className="w-4 h-4 text-green-500" />
            <span>Lifetime access</span>
          </div>
          <div className="flex items-center gap-2">
            <Iconify icon={checkIcon} className="w-4 h-4 text-green-500" />
            <span>14-day refund</span>
          </div>
          <div className="flex items-center gap-2">
            <Iconify icon={checkIcon} className="w-4 h-4 text-green-500" />
            <span>Free updates</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
