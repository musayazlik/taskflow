import { redirect } from "next/navigation";

// Force dynamic rendering because this page uses cookies (via layout)
export const dynamic = "force-dynamic";

export default function PanelPage() {
  // Redirect to dashboard
  redirect("/panel/dashboard");
}
