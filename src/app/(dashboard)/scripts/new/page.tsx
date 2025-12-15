"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { countWords, estimateDurationFromWords, formatDuration } from "@/lib/utils";

const tones = [
  { value: "casual", label: "Casual & Friendly" },
  { value: "professional", label: "Professional" },
  { value: "educational", label: "Educational" },
  { value: "entertaining", label: "Entertaining" },
];

const durations = [
  { value: "3", label: "Short (3 min)" },
  { value: "5", label: "Medium (5 min)" },
  { value: "10", label: "Standard (10 min)" },
  { value: "15", label: "Long (15 min)" },
  { value: "20", label: "Extended (20 min)" },
];

export default function NewScriptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const { user } = useUserStore();

  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState("casual");
  const [duration, setDuration] = useState("10");
  const [includeHook, setIncludeHook] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);

  const [generatedScript, setGeneratedScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic for your script");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          niche: niche || "general",
          tone,
          target_duration: parseInt(duration),
          include_hook: includeHook,
          include_cta: includeCTA,
          language: user?.language || "en",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate script");
      }

      setGeneratedScript(data.script);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedScript) return;

    setIsSaving(true);

    const supabase = createClient();
    const wordCount = countWords(generatedScript);
    const estimatedDuration = estimateDurationFromWords(wordCount);

    // If we have a project, save to that project
    if (projectId) {
      const { error: dbError } = await supabase.from("scripts").insert({
        project_id: projectId,
        content: generatedScript,
        word_count: wordCount,
        estimated_duration: estimatedDuration,
      });

      if (dbError) {
        setError(dbError.message);
        setIsSaving(false);
        return;
      }

      router.push(`/projects/${projectId}`);
    } else {
      // Create a new project with this script
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          user_id: user?.id,
          title: topic,
          status: "scripting",
        })
        .select()
        .single();

      if (projectError) {
        setError(projectError.message);
        setIsSaving(false);
        return;
      }

      await supabase.from("scripts").insert({
        project_id: project.id,
        content: generatedScript,
        word_count: wordCount,
        estimated_duration: estimatedDuration,
      });

      router.push(`/projects/${project.id}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = countWords(generatedScript);
  const estimatedDuration = estimateDurationFromWords(wordCount);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href={projectId ? `/projects/${projectId}` : "/scripts"}
        className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {projectId ? "Back to Project" : "Back to Scripts"}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">AI Script Generator</h1>
        <p className="text-foreground-secondary mt-1">
          Create engaging YouTube scripts with the power of AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Script Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Video Topic *
              </label>
              <Textarea
                placeholder="e.g., 10 productivity tips for remote workers that actually work"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Content Niche
              </label>
              <Input
                placeholder="e.g., Productivity, Tech, Gaming"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tone</label>
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

              <div>
                <label className="block text-sm font-medium mb-2">
                  Target Duration
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeHook}
                  onChange={(e) => setIncludeHook(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Include attention-grabbing hook</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeCTA}
                  onChange={(e) => setIncludeCTA(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Include call-to-action</span>
              </label>
            </div>

            <Button
              onClick={handleGenerate}
              isLoading={isGenerating}
              className="w-full"
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              {isGenerating ? "Generating..." : "Generate Script"}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Script */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated Script</CardTitle>
              {generatedScript && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{wordCount} words</Badge>
                  <Badge variant="outline">
                    ~{formatDuration(estimatedDuration)}
                  </Badge>
                </div>
              )}
            </div>
            {generatedScript && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
                  />
                </Button>
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {generatedScript ? (
              <div className="space-y-4">
                <Textarea
                  value={generatedScript}
                  onChange={(e) => setGeneratedScript(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleSave}
                  isLoading={isSaving}
                  className="w-full"
                >
                  Save Script
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Sparkles className="h-12 w-12 text-foreground-tertiary mb-4" />
                <p className="text-foreground-secondary">
                  Your generated script will appear here
                </p>
                <p className="text-sm text-foreground-tertiary mt-1">
                  Fill in the settings and click Generate
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
