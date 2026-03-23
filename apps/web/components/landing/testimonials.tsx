"use client";

import { Iconify } from "@/components/iconify";
import { motion } from "framer-motion";
import quoteIcon from "@iconify-icons/lucide/quote";
import starIcon from "@iconify-icons/lucide/star";
import { Marquee } from "@/components/marquee";
import { LANDING_TESTIMONIALS } from "@/constant/landing-content";

const firstRow = LANDING_TESTIMONIALS.slice(0, LANDING_TESTIMONIALS.length / 2);
const secondRow = LANDING_TESTIMONIALS.slice(LANDING_TESTIMONIALS.length / 2);

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof LANDING_TESTIMONIALS)[0];
}) {
  return (
    <div className="w-[350px] p-6 mx-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
      {/* Quote Icon */}
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Iconify icon={quoteIcon} className="w-5 h-5 text-primary" />
      </div>

      {/* Quote */}
      <p className="text-muted-foreground mb-6 leading-relaxed">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          {testimonial.avatar}
        </div>
        <div>
          <div className="font-semibold">{testimonial.author}</div>
          <div className="text-sm text-muted-foreground">
            {testimonial.role}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-6 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-background via-muted/30 to-background" />

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
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Loved by{" "}
              <span className="bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                developers
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how teams use TaskFlow to keep work moving and everyone aligned.
            </p>
          </motion.div>
        </div>

        {/* Marquee Testimonials */}
        <div className="relative">
          {/* First Row */}
          <Marquee pauseOnHover className="[--duration:40s] py-4">
            {firstRow.map((testimonial) => (
              <TestimonialCard
                key={testimonial.author}
                testimonial={testimonial}
              />
            ))}
          </Marquee>

          {/* Second Row - Reverse */}
          <Marquee reverse pauseOnHover className="[--duration:45s] py-4">
            {secondRow.map((testimonial) => (
              <TestimonialCard
                key={testimonial.author}
                testimonial={testimonial}
              />
            ))}
          </Marquee>

          {/* Gradient Overlays */}
          <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-background to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-background to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
}
