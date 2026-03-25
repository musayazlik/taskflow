import homeIcon from "@iconify-icons/lucide/home";
import zapIcon from "@iconify-icons/lucide/zap";
import workflowIcon from "@iconify-icons/lucide/workflow";
import usersIcon from "@iconify-icons/lucide/users";
import helpIcon from "@iconify-icons/lucide/help-circle";
import mailIcon from "@iconify-icons/lucide/mail";

import downloadIcon from "@iconify-icons/lucide/download";
import settingsIcon from "@iconify-icons/lucide/settings";
import rocketIcon from "@iconify-icons/lucide/rocket";

import shieldIcon from "@iconify-icons/lucide/shield";
import bellIcon from "@iconify-icons/lucide/bell";
import barChartIcon from "@iconify-icons/lucide/bar-chart-3";
import checkSquareIcon from "@iconify-icons/lucide/check-square";
import lockIcon from "@iconify-icons/lucide/lock";

import clockIcon from "@iconify-icons/lucide/clock";
import codeIcon from "@iconify-icons/lucide/code";


export const LANDING_HEADER_NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
];

export const LANDING_FLOATING_DOCK_ITEMS = [
  { icon: homeIcon, label: "Home", href: "#" },
  { icon: zapIcon, label: "Features", href: "#features" },
  { icon: workflowIcon, label: "How It Works", href: "#how-it-works" },
  { icon: usersIcon, label: "Testimonials", href: "#testimonials" },
  { icon: helpIcon, label: "FAQ", href: "#faq" },
  { icon: mailIcon, label: "Contact", href: "#cta" },
];

export const LANDING_HERO_AVATARS = [
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

export const LANDING_HERO_PILLS = [
  "Real-time task updates",
  "Collaborative workspaces",
  "Role-based access",
  "Notifications that keep everyone aligned",
];

export const LANDING_FEATURES = [
  {
    icon: zapIcon,
    title: "Real-time updates",
    description:
      "See task changes, assignments, and status updates instantly across your entire workspace.",
  },
  {
    icon: shieldIcon,
    title: "Role-based access",
    description:
      "Keep sensitive work protected with clear roles and permissions for every team member.",
  },
  {
    icon: usersIcon,
    title: "Team workspaces",
    description:
      "Organize tasks by team or project so everyone knows exactly where to focus.",
  },
  {
    icon: bellIcon,
    title: "Smart notifications",
    description:
      "Keep people informed without drowning them in noise, with focused alerts that matter.",
  },
  {
    icon: barChartIcon,
    title: "Progress visibility",
    description:
      "Track what is on track, blocked, or at risk with clear overviews of work in motion.",
  },
  {
    icon: checkSquareIcon,
    title: "Actionable task views",
    description:
      "Filter by assignee, status, or priority so everyone sees the tasks that matter to them.",
  },
  {
    icon: lockIcon,
    title: "Secure by design",
    description:
      "Built with modern security best practices to keep your workspace and data safe.",
  },
  {
    icon: zapIcon,
    title: "Fast to adopt",
    description:
      "Onboard your team quickly with an interface that feels familiar but is optimized for focus.",
  },
];

export const LANDING_HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "Create your workspace",
    description:
      "Set up a TaskFlow workspace for your team and organize projects by product, squad, or client.",
    icon: downloadIcon,
    checks: ["Create workspace", "Define projects", "Invite first members"],
  },
  {
    number: "02",
    title: "Add tasks & owners",
    description:
      "Break work into clear tasks, assign owners, and set priorities so everyone knows what to do next.",
    icon: settingsIcon,
    checks: ["Create task lists", "Assign owners", "Set priorities"],
  },
  {
    number: "03",
    title: "Track progress in real time",
    description:
      "Watch work move from backlog to done with live updates, filters, and views that fit your process.",
    icon: rocketIcon,
    checks: ["Follow status changes", "Review workloads", "Share updates"],
  },
];

export const LANDING_LOGOS = [
  { name: "Next.js", icon: "logos:nextjs-icon" },
  { name: "TypeScript", icon: "logos:typescript-icon" },
  { name: "Prisma", icon: "material-icon-theme:prisma" },
  { name: "Tailwind", icon: "logos:tailwindcss-icon" },
  { name: "PostgreSQL", icon: "logos:postgresql" },
  { name: "Docker", icon: "logos:docker-icon" },
  { name: "Redis", icon: "logos:redis" },
  { name: "GitHub", icon: "logos:github-icon" },
  { name: "Bun", icon: "simple-icons:bun" },
];

export const LANDING_STATS = [
  {
    icon: clockIcon,
    value: "100+",
    label: "Hours Saved",
    description: "On initial setup and configuration",
  },
  {
    icon: codeIcon,
    value: "100%",
    label: "TypeScript",
    description: "End-to-end type safety",
  },
  {
    icon: usersIcon,
    value: "500+",
    label: "Developers",
    description: "Already shipping faster",
  },
  {
    icon: zapIcon,
    value: "5min",
    label: "Setup Time",
    description: "From clone to running",
  },
];

export type LandingTestimonial = {
  quote: string;
  author: string;
  role: string;
  avatar: string;
};

export const LANDING_TESTIMONIALS: LandingTestimonial[] = [
  {
    quote:
      "TaskFlow finally gave us one place to see who is working on what. Standups are shorter and far more focused.",
    author: "Sarah Chen",
    role: "CTO at TechStart",
    avatar: "SC",
  },
  {
    quote:
      "Our team used to live in spreadsheets and chat threads. With TaskFlow, every task has a clear owner and status.",
    author: "Marcus Johnson",
    role: "Senior Developer",
    avatar: "MJ",
  },
  {
    quote:
      "We onboarded the whole team in one afternoon. Everyone knew exactly what to do next and what was blocked.",
    author: "Emily Rodriguez",
    role: "Founder at LaunchPad",
    avatar: "ER",
  },
  {
    quote:
      "Real-time updates in TaskFlow mean I do not have to chase people for status. I just open the board and see reality.",
    author: "David Kim",
    role: "Lead Engineer",
    avatar: "DK",
  },
  {
    quote:
      "Best investment for our startup. The clarity around priorities and responsibilities paid off in the first week.",
    author: "Lisa Thompson",
    role: "Co-founder at SaaSify",
    avatar: "LT",
  },
  {
    quote:
      "Simple, fast, and opinionated in the right ways. TaskFlow is now where all of our projects start.",
    author: "Alex Martinez",
    role: "Full Stack Developer",
    avatar: "AM",
  },
];

export const LANDING_FAQS = [
  {
    question: "What is TaskFlow?",
    answer:
      "TaskFlow is a real-time task management platform that helps teams organize work, assign owners, and track progress in a single place.",
  },
  {
    question: "Do I need to know TypeScript?",
    answer:
      "No. TaskFlow is a web application you access in your browser. If you integrate it with your own systems, TypeScript is helpful but not required.",
  },
  {
    question: "Can I use TaskFlow with my team?",
    answer:
      "Yes. You can invite your teammates to a shared workspace, assign tasks to each other, and control access with roles and permissions.",
  },
  {
    question: "How do I get support?",
    answer:
      "You can reach us through our community channels or by contacting our support team directly.",
  },
  {
    question: "Do I get updates?",
    answer:
      "Absolutely. We continuously improve TaskFlow and roll out new features. You automatically get access to updates as they are released.",
  },
  {
    question: "Is my data secure?",
    answer:
      "TaskFlow is built with modern security best practices. We use encryption in transit, role-based access control, and follow strict security guidelines to keep your data safe.",
  },
];

