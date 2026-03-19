"use client";

import { useState } from "react";
import { Iconify } from "@/components/iconify";
import { motion, AnimatePresence } from "framer-motion";
import helpCircleIcon from "@iconify-icons/lucide/help-circle";
import chevronDownIcon from "@iconify-icons/lucide/chevron-down";
import messageCircleIcon from "@iconify-icons/lucide/message-circle";

const faqs = [
  {
    question: "What is Taskflow?",
    answer:
      "Taskflow is a real-time task management platform that helps teams organize work, assign owners, and track progress in a single place.",
  },
  {
    question: "Do I need to know TypeScript?",
    answer:
      "No. Taskflow is a web application you access in your browser. If you integrate it with your own systems, TypeScript is helpful but not required.",
  },
  {
    question: "Can I use Taskflow with my team?",
    answer:
      "Yes. You can invite your teammates to a shared workspace, assign tasks to each other, and control access with roles and permissions.",
  },
  {
    question: "What is included in the Pro plan?",
    answer:
      "Pro includes everything in Free plus unlimited projects and workspaces, advanced filters and views, role-based access control, activity history, and priority support.",
  },
  {
    question: "How do I get support?",
    answer:
      "Free users get community support. Paid plans include email support with faster response times, and Enterprise customers get a dedicated success manager.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Yes, we offer a 14-day refund window for paid plans. If Taskflow is not a fit, you can contact us within 14 days of purchase.",
  },
  {
    question: "Do I get updates?",
    answer:
      "Absolutely. We continuously improve Taskflow and roll out new features. You automatically get access to updates as they are released.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Taskflow is built with modern security best practices. We use encryption in transit, role-based access control, and follow strict security guidelines to keep your data safe.",
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
