"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Textarea,
} from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Sparkles,
  TrendingUp,
  Copy,
  Check,
  Hash,
  FileText,
  Type,
} from "lucide-react";

interface KeywordResult {
  keyword: string;
  search_volume: number;
  competition: "low" | "medium" | "high";
  trend: "rising" | "stable" | "declining";
}

export default function SEOPage() {
  const [activeTab, setActiveTab] = useState("keywords");

  // Keywords state
  const [keywordQuery, setKeywordQuery] = useState("");
  const [keywords, setKeywords] = useState<KeywordResult[]>([]);
  const [isSearchingKeywords, setIsSearchingKeywords] = useState(false);

  // Titles state
  const [titleTopic, setTitleTopic] = useState("");
  const [titleKeywords, setTitleKeywords] = useState("");
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);

  // Description state
  const [descTitle, setDescTitle] = useState("");
  const [descSummary, setDescSummary] = useState("");
  const [descKeywords, setDescKeywords] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // Tags state
  const [tagTopic, setTagTopic] = useState("");
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Mock keyword search (would integrate with real API)
  const handleKeywordSearch = async () => {
    if (!keywordQuery.trim()) return;
    setIsSearchingKeywords(true);

    // Simulated results - in production, use YouTube Data API or third-party service
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockResults: KeywordResult[] = [
      { keyword: keywordQuery, search_volume: 25000, competition: "medium", trend: "rising" },
      { keyword: `${keywordQuery} tutorial`, search_volume: 18000, competition: "low", trend: "stable" },
      { keyword: `${keywordQuery} for beginners`, search_volume: 15000, competition: "low", trend: "rising" },
      { keyword: `best ${keywordQuery}`, search_volume: 12000, competition: "high", trend: "stable" },
      { keyword: `how to ${keywordQuery}`, search_volume: 22000, competition: "medium", trend: "rising" },
    ];

    setKeywords(mockResults);
    setIsSearchingKeywords(false);
  };

  const handleGenerateTitles = async () => {
    if (!titleTopic.trim()) return;
    setIsGeneratingTitles(true);

    try {
      const response = await fetch("/api/ai/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: titleTopic,
          keywords: titleKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();
      if (data.titles) {
        setGeneratedTitles(data.titles);
      }
    } catch (error) {
      console.error("Title generation error:", error);
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!descTitle.trim()) return;
    setIsGeneratingDesc(true);

    try {
      const response = await fetch("/api/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: descTitle,
          script_summary: descSummary,
          keywords: descKeywords.split(",").map((k) => k.trim()).filter(Boolean),
          include_timestamps: true,
        }),
      });

      const data = await response.json();
      if (data.description) {
        setGeneratedDescription(data.description);
      }
    } catch (error) {
      console.error("Description generation error:", error);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!tagTopic.trim()) return;
    setIsGeneratingTags(true);

    // Mock tags generation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockTags = [
      tagTopic,
      `${tagTopic} tutorial`,
      `${tagTopic} tips`,
      `${tagTopic} 2024`,
      `how to ${tagTopic}`,
      `best ${tagTopic}`,
      `${tagTopic} guide`,
      `${tagTopic} for beginners`,
      `learn ${tagTopic}`,
      `${tagTopic} tricks`,
    ];

    setGeneratedTags(mockTags);
    setIsGeneratingTags(false);
  };

  const handleCopy = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">SEO Tools</h1>
        <p className="text-foreground-secondary mt-1">
          Optimize your videos for maximum discoverability
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="keywords">
            <Search className="h-4 w-4 mr-2" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="titles">
            <Type className="h-4 w-4 mr-2" />
            Titles
          </TabsTrigger>
          <TabsTrigger value="description">
            <FileText className="h-4 w-4 mr-2" />
            Description
          </TabsTrigger>
          <TabsTrigger value="tags">
            <Hash className="h-4 w-4 mr-2" />
            Tags
          </TabsTrigger>
        </TabsList>

        {/* Keywords Tab */}
        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Research</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a topic or keyword..."
                  value={keywordQuery}
                  onChange={(e) => setKeywordQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleKeywordSearch()}
                  leftIcon={<Search className="h-4 w-4" />}
                  className="flex-1"
                />
                <Button
                  onClick={handleKeywordSearch}
                  isLoading={isSearchingKeywords}
                >
                  Search
                </Button>
              </div>

              {keywords.length > 0 && (
                <div className="space-y-2">
                  {keywords.map((kw, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-background-secondary"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{kw.keyword}</span>
                        <Badge
                          variant={
                            kw.trend === "rising"
                              ? "success"
                              : kw.trend === "declining"
                              ? "error"
                              : "outline"
                          }
                        >
                          {kw.trend === "rising" && (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          )}
                          {kw.trend}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-foreground-secondary">
                          {kw.search_volume.toLocaleString()} searches/mo
                        </span>
                        <Badge
                          variant={
                            kw.competition === "low"
                              ? "success"
                              : kw.competition === "high"
                              ? "error"
                              : "warning"
                          }
                        >
                          {kw.competition}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleCopy(kw.keyword, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Titles Tab */}
        <TabsContent value="titles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Titles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Video Topic
                  </label>
                  <Input
                    placeholder="e.g., How to grow a YouTube channel in 2024"
                    value={titleTopic}
                    onChange={(e) => setTitleTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Target Keywords (comma separated)
                  </label>
                  <Input
                    placeholder="e.g., youtube growth, subscribers, views"
                    value={titleKeywords}
                    onChange={(e) => setTitleKeywords(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleGenerateTitles}
                  isLoading={isGeneratingTitles}
                  className="w-full"
                  leftIcon={<Sparkles className="h-4 w-4" />}
                >
                  Generate Titles
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Titles</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedTitles.length > 0 ? (
                  <div className="space-y-2">
                    {generatedTitles.map((title, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-background-secondary group"
                      >
                        <span className="text-sm">{title}</span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleCopy(title, index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-foreground-secondary">
                    Generated titles will appear here
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Description Tab */}
        <TabsContent value="description" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Video Title
                  </label>
                  <Input
                    placeholder="Enter your video title"
                    value={descTitle}
                    onChange={(e) => setDescTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Video Summary
                  </label>
                  <Textarea
                    placeholder="Brief summary of what the video covers..."
                    value={descSummary}
                    onChange={(e) => setDescSummary(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Keywords (comma separated)
                  </label>
                  <Input
                    placeholder="e.g., youtube, growth, subscribers"
                    value={descKeywords}
                    onChange={(e) => setDescKeywords(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleGenerateDescription}
                  isLoading={isGeneratingDesc}
                  className="w-full"
                  leftIcon={<Sparkles className="h-4 w-4" />}
                >
                  Generate Description
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Generated Description</CardTitle>
                {generatedDescription && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(generatedDescription)}
                  >
                    {copiedText === generatedDescription ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-success" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {generatedDescription ? (
                  <Textarea
                    value={generatedDescription}
                    onChange={(e) => setGeneratedDescription(e.target.value)}
                    rows={15}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="text-center py-8 text-foreground-secondary">
                    Generated description will appear here
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your video topic..."
                  value={tagTopic}
                  onChange={(e) => setTagTopic(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleGenerateTags}
                  isLoading={isGeneratingTags}
                  leftIcon={<Sparkles className="h-4 w-4" />}
                >
                  Generate
                </Button>
              </div>

              {generatedTags.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Generated Tags</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(generatedTags.join(", "))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generatedTags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-surface-hover"
                        onClick={() => handleCopy(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
