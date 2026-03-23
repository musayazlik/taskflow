import { Metadata } from "next";

import { TasksPageClient } from "./components/tasks-page-client";

export const metadata: Metadata = {
  title: "Tasks | TaskFlow",
  description: "Create and manage your tasks in real time.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TasksPage() {
  return <TasksPageClient />;
}

