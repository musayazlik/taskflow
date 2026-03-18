"use client";

import { useState, useEffect } from "react";
import {
  Type,
  Loader2,
  Copy,
  Check,
  Sparkles,
  Globe,
  FileText,
  Hash,
  RefreshCw,
  Bot,
  Wand2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@repo/shadcn-ui/button";
import { Input } from "@repo/shadcn-ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/select";
import { Label } from "@repo/shadcn-ui/label";
import { Badge } from "@repo/shadcn-ui/badge";
import { Slider } from "@repo/shadcn-ui/slider";
import { cn } from "@/lib/utils";
import { useActiveModels } from "@/stores/ai-models-store";
import { aiService } from "@/services/ai.service";
import type { SEOResult } from "@/services/types";
import { toast } from "sonner";
import { PageHeader } from "@/components/panel/page-header";

export default function SEOGeneratorPage() {
  const activeModels = useActiveModels();
  // Filter for text models only
  const textModels = activeModels.filter(
    (m) => !m.modelId.includes("image") && !m.modelId.includes("dall-e"),
  );

  const [selectedModel, setSelectedModel] = useState<string>("");
  const [topic, setTopic] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("en");
  const [creativity, setCreativity] = useState([0.7]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SEOResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Auto-select first model
  useEffect(() => {
    if (textModels.length > 0 && !selectedModel) {
      setSelectedModel(textModels[0]!.modelId);
    }
  }, [textModels, selectedModel]);

  const handleGenerate = async () => {
    if (!topic.trim() || !selectedModel) return;

    setIsGenerating(true);

    try {
      const response = await aiService.generateSEO({
        model: selectedModel,
        topic,
        targetKeyword: targetKeyword || undefined,
        tone,
        language,
        creativity: creativity[0] ?? 0.7,
      });

      if (response.success && response.data) {
        setResult(response.data);
        toast.success("SEO content generated successfully!");
      } else {
        toast.error(response.message || "Failed to generate SEO content");
      }
    } catch (error) {
      console.error("SEO generation error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReset = () => {
    setResult(null);
    setTopic("");
    setTargetKeyword("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Type}
        title="SEO Generator"
        description="Generate SEO-optimized titles, descriptions & keywords"
        actions={
          <>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {textModels.length > 0 ? (
                  textModels.map((model) => (
                    <SelectItem key={model.id} value={model.modelId}>
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <span className="truncate">{model.name}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No models configured
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </>
        }
      />

      {/* No Models Warning */}
      {textModels.length === 0 && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                No AI models configured
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Please configure AI models in the Model Settings page first.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Generate SEO Content
            </CardTitle>
            <CardDescription>
              Enter your topic and preferences to generate optimized SEO content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Topic / Page Title *</Label>
              <Input
                placeholder="e.g., React Best Practices"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Target Keyword</Label>
              <Input
                placeholder="e.g., react development"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="authoritative">Authoritative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tr">Turkish</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Creativity Level</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round((creativity[0] ?? 0.7) * 100)}%
                </span>
              </div>
              <Slider
                value={creativity}
                onValueChange={setCreativity}
                min={0}
                max={1}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Lower = more focused, Higher = more creative
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={!topic.trim() || !selectedModel || isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate SEO Content
                  </>
                )}
              </Button>
              {result && (
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generated Content
            </CardTitle>
            <CardDescription>
              Copy the generated content to use in your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                  <Globe className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Content Yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  Fill in the form and click Generate to create SEO-optimized
                  content
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Meta Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Meta Title
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(result.title, "title")}
                    >
                      {copiedField === "title" ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border">
                    <p className="text-sm">{result.title}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        result.title.length > 60
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground",
                      )}
                    >
                      {result.title.length}/60 characters
                      {result.title.length > 60 && " (too long)"}
                    </p>
                  </div>
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Meta Description
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopy(result.description, "description")
                      }
                    >
                      {copiedField === "description" ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border">
                    <p className="text-sm">{result.description}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        result.description.length > 160
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground",
                      )}
                    >
                      {result.description.length}/160 characters
                      {result.description.length > 160 && " (too long)"}
                    </p>
                  </div>
                </div>

                {/* Keywords */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Keywords
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopy(result.keywords.join(", "), "keywords")
                      }
                    >
                      {copiedField === "keywords" ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border">
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((keyword: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* OG Title & Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Open Graph
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopy(
                          `${result.ogTitle}\n${result.ogDescription}`,
                          "og",
                        )
                      }
                    >
                      {copiedField === "og" ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border space-y-2">
                    <p className="text-sm font-medium">{result.ogTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {result.ogDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
