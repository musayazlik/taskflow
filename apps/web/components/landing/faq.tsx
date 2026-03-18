"use client";

import { useState } from "react";
import { Iconify } from "@/components/iconify";
import { motion, AnimatePresence } from "framer-motion";
import helpCircleIcon from "@iconify-icons/lucide/help-circle";
import chevronDownIcon from "@iconify-icons/lucide/chevron-down";
import messageCircleIcon from "@iconify-icons/lucide/message-circle";

const faqs = [
  {
    question: "What is TurboStack?",
    answer:
      "TurboStack is a production-ready monorepo starter kit for building modern SaaS applications. It includes Next.js frontend, Elysia.js backend, Prisma ORM, authentication, payments, and AI integration - all pre-configured and ready to use.",
  },
  {
    question: "Do I need to know TypeScript?",
    answer:
      "While TurboStack is built with TypeScript for type safety, you can use it with basic JavaScript knowledge. However, we recommend learning TypeScript as it helps catch errors early and improves developer experience.",
  },
  {
    question: "Can I use TurboStack for commercial projects?",
    answer:
      "Yes! Both Free and Pro plans allow commercial use. The Free plan is perfect for learning and small projects, while Pro includes features needed for production SaaS applications.",
  },
  {
    question: "What is included in the Pro version?",
    answer:
      "Pro includes everything in Free plus production-ready authentication, Polar payments integration, AI integration with OpenRouter, admin dashboard, email templates with Resend, role-based access control, API rate limiting, and priority support.",
  },
  {
    question: "How do I get support?",
    answer:
      "Free users get community support through Discord. Pro users receive priority email support with faster response times. Enterprise customers get a dedicated support channel and SLA guarantee.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Yes, we offer a 14-day refund guarantee. If you're not satisfied with TurboStack Pro, contact us within 14 days of purchase for a full refund.",
  },
  {
    question: "Do I get updates?",
    answer:
      "Absolutely! All purchases include lifetime access to updates. When we add new features, fix bugs, or improve the codebase, you'll get access to everything at no additional cost.",
  },
  {
    question: "What technologies are used?",
    answer:
      "TurboStack uses Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Elysia.js, Prisma, PostgreSQL, and Bun. It also integrates with Polar for payments, Resend for emails, and OpenRouter for AI features.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-6">
      <div className="mx-auto max-w-3xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Iconify icon={helpCircleIcon} className="w-4 h-4" />
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Frequently asked{" "}
              <span className="bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                questions
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know before getting started.
            </p>
          </motion.div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className={`rounded-2xl border transition-all ${
                openIndex === index
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left"
              >
                <span className="font-semibold text-lg">{faq.question}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    openIndex === index
                      ? "bg-primary text-white rotate-180"
                      : "bg-muted"
                  }`}
                >
                  <Iconify icon={chevronDownIcon} className="w-5 h-5" />
                </div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-6">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border hover:border-primary/50 transition-all"
          >
            <Iconify icon={messageCircleIcon} className="w-5 h-5" />
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
}
