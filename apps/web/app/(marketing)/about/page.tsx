import { Metadata } from "next";
import Image from "next/image";
import { Iconify } from "@/components/iconify";

import targetIcon from "@iconify-icons/lucide/target";
import eyeIcon from "@iconify-icons/lucide/eye";
import heartIcon from "@iconify-icons/lucide/heart";
import zapIcon from "@iconify-icons/lucide/zap";
import codeIcon from "@iconify-icons/lucide/code";
import usersIcon from "@iconify-icons/lucide/users";
import rocketIcon from "@iconify-icons/lucide/rocket";
import checkCircleIcon from "@iconify-icons/lucide/check-circle";

export const metadata: Metadata = {
  title: "About Us - TaskFlow",
  description:
    "Learn about TaskFlow's mission, vision, and the team behind the modern fullstack monorepo starter.",
};

const values = [
  {
    icon: zapIcon,
    title: "Performance First",
    description:
      "We believe in building fast, efficient applications that scale with your business needs.",
  },
  {
    icon: codeIcon,
    title: "Developer Experience",
    description:
      "Our tools are designed to make developers' lives easier, not harder.",
  },
  {
    icon: usersIcon,
    title: "Community Driven",
    description:
      "We listen to our community and build features that matter to real developers.",
  },
  {
    icon: rocketIcon,
    title: "Innovation",
    description:
      "We stay ahead of the curve, adopting the latest technologies and best practices.",
  },
];

const milestones = [
  {
    year: "2024",
    title: "Project Started",
    description: "TaskFlow was born from the need for a better starter kit.",
  },
  {
    year: "2025",
    title: "First Release",
    description: "Launched with full-stack architecture and AI-safe rules.",
  },
  {
    year: "2025",
    title: "Growing Community",
    description: "Thousands of developers building with TaskFlow.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Iconify icon={usersIcon} className="w-4 h-4" />
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            About <span className="gradient-text">TaskFlow</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're building the future of full-stack development, one line of
            code at a time.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          <div className="p-8 rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Iconify icon={targetIcon} className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To empower developers with a production-ready, AI-safe full-stack
              starter that eliminates boilerplate and architectural decisions,
              so they can focus on building what matters.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Iconify icon={eyeIcon} className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To become the go-to starter kit for developers who want to build
              modern, scalable applications with confidence, knowing their
              architecture is future-proof and AI-friendly.
            </p>
          </div>
        </div>

        {/* Values */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Iconify icon={value.icon} className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Key milestones in our story
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary via-primary/50 to-primary/20 hidden md:block" />

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative flex gap-6">
                  {/* Timeline dot */}
                  <div className="hidden md:flex items-center justify-center w-16 shrink-0">
                    <div className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg" />
                  </div>

                  <div className="flex-1 p-6 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {milestone.year}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section>
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex flex-col gap-6">
              {/* Top Bar with Avatar and Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  MY
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Hey, I'm James C. Quicks 👋
                </h2>
              </div>

              {/* Intro Text */}
              <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                <p>
                  As a digital transformation architect, I do more than just
                  turn ideas into code—I help you build the future. Combining
                  years of software experience with freelance flexibility, I'm a
                  tech enthusiast who delivers boutique, results-driven
                  solutions.
                </p>

                <p>
                  As the founder of Codelify.net, I combine my individual
                  talents with the collective power of my team. For large-scale
                  projects, we're here with our professional team. I put aside
                  complex technical jargon and focus entirely on your business
                  growth and user experience.
                </p>

                <p className="font-medium text-foreground italic border-l-2 border-primary pl-4 py-1">
                  &ldquo;With an approach that thinks like your business
                  partner, let's take your project to the next level.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-24 text-center">
          <div className="p-12 rounded-2xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <h2 className="text-3xl font-bold mb-4">
              Ready to build with TaskFlow?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already building amazing
              applications with our starter kit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
                <Iconify icon={rocketIcon} className="w-5 h-5" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-card border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
