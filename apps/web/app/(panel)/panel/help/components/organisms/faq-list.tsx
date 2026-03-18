"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { ScrollArea } from "@repo/shadcn-ui/scroll-area";
import { Badge } from "@repo/shadcn-ui/badge";
import { Button } from "@repo/shadcn-ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/shadcn-ui/collapsible";
import { HelpCircle, Book, ExternalLink, ChevronDown } from "lucide-react";

interface FAQ {
  id: string | number;
  question: string;
  answer: string;
  category: string;
}

interface FAQListProps {
  filteredFaqs: FAQ[];
  searchQuery: string;
  openFaqs: string[];
  onToggleFaq: (faqId: string) => void;
}

export function FAQList({
  filteredFaqs,
  searchQuery,
  openFaqs,
  onToggleFaq,
}: FAQListProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              {filteredFaqs.length} question(s) found
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <ScrollArea className="h-[500px]">
        <CardContent>
          {filteredFaqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 mb-4">
                <HelpCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No FAQs found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "No FAQs available in this category"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqs.includes(String(faq.id));
                return (
                  <Collapsible
                    key={faq.id}
                    open={isOpen}
                    onOpenChange={() => onToggleFaq(String(faq.id))}
                  >
                    <Card className="border hover:border-primary/50 transition-colors">
                      <CollapsibleTrigger asChild>
                        <CardContent className="p-4 cursor-pointer">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {faq.category}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-sm mb-2 text-left">
                                {faq.question}
                              </h3>
                              {!isOpen && (
                                <p className="text-sm text-muted-foreground line-clamp-2 text-left">
                                  {faq.answer}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <ChevronDown
                                className={`h-4 w-4 text-muted-foreground transition-transform ${
                                  isOpen ? "transform rotate-180" : ""
                                }`}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-4 px-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
