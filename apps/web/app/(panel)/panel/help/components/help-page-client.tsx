"use client";

import { useState } from "react";
import {
  HelpCircle,
  Book,
  MessageSquare,
  Mail,
  FileText,
  Video,
  Code,
  Shield,
} from "lucide-react";
import {
  PANEL_FAQ_CATEGORIES,
  PANEL_FAQS,
  PANEL_QUICK_LINKS,
} from "@repo/types";
import { SearchBar } from "./molecules/search-bar";
import { QuickLinksGrid } from "./organisms/quick-links-grid";
import { FAQCategoriesSidebar } from "./organisms/faq-categories-sidebar";
import { FAQList } from "./organisms/faq-list";
import { ContactSupportCard } from "./organisms/contact-support-card";
import { PageHeader } from "@/components/panel/page-header";

const iconMap = {
  "Getting Started": Book,
  "Account & Billing": FileText,
  "API & Integration": Code,
  Security: Shield,
} as const;

const linkIconMap = {
  Documentation: Book,
  "Video Tutorials": Video,
  "Community Forum": MessageSquare,
  "Contact Support": Mail,
} as const;

const faqCategories = PANEL_FAQ_CATEGORIES.map((category) => {
  const { id, ...rest } = category;
  return {
    ...rest,
    id: String(id),
    icon: iconMap[category.title as keyof typeof iconMap],
  };
});

const faqs = [...PANEL_FAQS];
const quickLinks = PANEL_QUICK_LINKS.map((link) => {
  const linkAny = link as { title: string; description: string; href: string };
  return {
    title: linkAny.title,
    description: linkAny.description,
    url: linkAny.href,
    icon: linkIconMap[linkAny.title as keyof typeof linkIconMap],
  };
});

export function HelpPageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openFaqs, setOpenFaqs] = useState<string[]>([]);

  // Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    if (selectedCategory && faq.category !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const toggleFaq = (faqId: string) => {
    setOpenFaqs((prev) =>
      prev.includes(faqId)
        ? prev.filter((id) => id !== faqId)
        : [...prev, faqId],
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HelpCircle}
        title="Help & Support"
        description="Find answers and get the help you need"
        titleSize="large"
      />

      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <QuickLinksGrid quickLinks={quickLinks} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FAQCategoriesSidebar
          faqCategories={faqCategories}
          faqs={faqs}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <FAQList
          filteredFaqs={filteredFaqs}
          searchQuery={searchQuery}
          openFaqs={openFaqs}
          onToggleFaq={toggleFaq}
        />
      </div>

      <ContactSupportCard />
    </div>
  );
}
