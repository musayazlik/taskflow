"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Loader2,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Bot,
  Wand2,
  BookOpen,
  List,
  AlignLeft,
  Download,
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
import { Slider } from "@repo/shadcn-ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/shadcn-ui/tabs";
import { Badge } from "@repo/shadcn-ui/badge";
import { cn } from "@/lib/utils";
import { useActiveModels } from "@/stores/ai-models-store";
import { aiService } from "@/services/ai.service";
import type { ContentResult } from "@/services/types";
import { toast } from "sonner";
import { PageHeader } from "@/components/panel/page-header";

const contentTypes = [
  { value: "blog", label: "Blog Post", icon: BookOpen },
  { value: "article", label: "Article", icon: FileText },
  { value: "product", label: "Product Description", icon: List },
  { value: "social", label: "Social Media Post", icon: AlignLeft },
];

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "persuasive", label: "Persuasive" },
  { value: "informative", label: "Informative" },
  { value: "humorous", label: "Humorous" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "tr", label: "Turkish" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "it", label: "Italian" },
];

export default function ContentWriterPage() {
  const activeModels = useActiveModels();
  // Filter for text models only
  const textModels = activeModels.filter(
    (m) => !m.modelId.includes("image") && !m.modelId.includes("dall-e"),
  );

  const [selectedModel, setSelectedModel] = useState<string>("");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [contentType, setContentType] = useState("blog");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("en");
  const [length, setLength] = useState([500]);
  const [creativity, setCreativity] = useState([0.7]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("content");

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
      const response = await aiService.generateContent({
        model: selectedModel,
        topic,
        keywords: keywords || undefined,
        contentType,
        tone,
        language,
        targetLength: length[0] ?? 500,
        creativity: creativity[0] ?? 0.7,
      });

      if (response.success && response.data) {
        setResult(response.data);
        toast.success("Content generated successfully!");
      } else {
        toast.error(response.message || "Failed to generate content");
      }
    } catch (error) {
      console.error("Content generation error:", error);
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
    setKeywords("");
  };

  const handleDownload = () => {
    if (!result) return;

    const blob = new Blob([result.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Content downloaded as Markdown");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Content Writer"
        description="Generate high-quality content with AI assistance"

        actions={
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Content Settings
            </CardTitle>
            <CardDescription>
              Configure your content generation parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Topic / Title *</Label>
              <Input
                placeholder="e.g., Digital Marketing Strategies"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Target Keywords</Label>
              <Input
                placeholder="e.g., marketing, digital, strategy"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separate keywords with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
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
                    {languages.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Target Length</Label>
                <span className="text-sm text-muted-foreground">
                  ~{length[0]} words
                </span>
              </div>
              <Slider
                value={length}
                onValueChange={setLength}
                min={200}
                max={2000}
                step={100}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Creativity</Label>
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
                    Generate Content
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

        {/* Results Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Generated Content
                </CardTitle>
                <CardDescription>
                  {result
                    ? `${result.wordCount} words`
                    : "Your content will appear here"}
                </CardDescription>
              </div>
              {result && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(result.content, "all")}
                  >
                    {copiedField === "all" ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center h-[500px] text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 mb-4">
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Content Yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  Configure your settings and click Generate to create
                  AI-powered content
                </p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger
                    value="content"
                    className="flex items-center gap-2"
                  >
                    <AlignLeft className="h-4 w-4" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger
                    value="outline"
                    className="flex items-center gap-2"
                  >
                    <List className="h-4 w-4" />
                    Outline
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-0">
                  <div className="h-[500px] overflow-auto">
                    <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border">
                      <div className="whitespace-pre-wrap font-mono text-sm">
                        {result.content}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="outline" className="mt-0">
                  <div className="h-[500px] overflow-auto">
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border space-y-3">
                      <h3 className="font-semibold text-lg">{result.title}</h3>
                      <div className="space-y-2">
                        {result.outline.map((item: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-lg border"
                          >
                            <Badge variant="secondary" className="shrink-0">
                              {index + 1}
                            </Badge>
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
