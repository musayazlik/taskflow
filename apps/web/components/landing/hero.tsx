"use client";

import Link from "next/link";
import { Iconify } from "@/components/iconify";
import arrowRightIcon from "@iconify-icons/lucide/arrow-right";
import githubIcon from "@iconify-icons/lucide/github";
import starIcon from "@iconify-icons/lucide/star";
import { motion } from "framer-motion";
import { Particles } from "@/components/particles";
import { AuroraText } from "@/components/aurora-text";
import { AvatarCircles } from "@/components/avatar-circles";
import { BorderBeam } from "@/components/border-beam";

const avatars = [
  {
    imageUrl: "https://avatars.githubusercontent.com/u/16860528",
    profileUrl: "https://github.com/dillionverma",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/20110627",
    profileUrl: "https://github.com/tomonari",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/124599",
    profileUrl: "https://github.com/zenorocha",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/1011721",
    profileUrl: "https://github.com/peduarte",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/1500684",
    profileUrl: "https://github.com/kentcdodds",
  },
];

const features = [
  "Real-time task updates",
  "Collaborative workspaces",
  "Role-based access",
  "Notifications that keep everyone aligned",
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-background to-background" />
        <Particles
          className="absolute inset-0"
          quantity={100}
          ease={80}
          color="#8b5cf6"
          refresh
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-linear-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-linear-to-l from-blue-500/10 via-primary/10 to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[4rem_4rem]" />

      <div className="mx-auto px-6 py-20">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">
          {/* Left Content */}
          <div className="w-full flex flex-col items-center justify-center gap-4">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Real-time collaboration for modern teams
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center font-bold tracking-tight mb-6 leading-[1.1]"
            >
              <span className="text-foreground">Stay on top of every</span>
              <br />
              <AuroraText
                colors={["#8b5cf6", "#ec4899", "#06b6d4", "#a855f7"]}
                speed={1.5}
              >
                task in real time
              </AuroraText>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-center text-muted-foreground max-w-2xl mb-8 leading-relaxed"
            >
              Taskflow is a real-time task management platform that helps teams assign work, track progress, and stay aligned without endless status meetings.
            </motion.p>

            {/* Avatar Circles + Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              <AvatarCircles avatarUrls={avatars} numPeople={99} />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Iconify
                      key={i}
                      icon={starIcon}
                      className="w-4 h-4 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>
                <span className="font-medium text-foreground">4.9</span>
                <span>from</span>
                <span className="font-medium text-foreground">2,000+</span>
                <span>developers</span>
              </div>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center gap-4"
            >
              <Link
                href="/register"
                className="group relative flex items-center gap-2 px-8 py-4 rounded-full bg-linear-to-r from-primary to-purple-600 text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 overflow-hidden"
              >
                Start using Taskflow
                <Iconify
                  icon={arrowRightIcon}
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
