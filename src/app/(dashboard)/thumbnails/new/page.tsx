"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
  Download,
  RefreshCw,
  Check,
} from "lucide-react";

const styles = [
  { value: "gaming", label: "Gaming" },
  { value: "vlog", label: "Vlog" },
  { value: "tutorial", label: "Tutorial" },
  { value: "review", label: "Review" },
  { value: "news", label: "News" },
  { value: "entertainment", label: "Entertainment" },
];

export default function NewThumbnailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("tutorial");
  const [includeText, setIncludeText] = useState(true);
  const [textContent, setTextContent] = useState("");

  const [generatedImages, setGeneratedImages] = useState<
    { url: string; ctr_score: number | null }[]
  >([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please describe your thumbnail");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const fullPrompt = `${prompt}. Style: ${style}. ${
        includeText && textContent
          ? `Include text overlay: "${textContent}"`
          : ""
      }`;

      const response = await fetch("/api/ai/thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          project_id: projectId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate thumbnail");
      }

      setGeneratedImages((prev) => [
        ...prev,
        { url: data.image_url, ctr_score: data.ctr_score },
      ]);
      setSelectedIndex(generatedImages.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (selectedIndex === null || !generatedImages[selectedIndex]) return;

    setIsSaving(true);

    // If already saved via API (when project_id was provided), just redirect
    if (projectId) {
      router.push(`/projects/${projectId}`);
    } else {
      // Create a new project with this thumbnail
      // For now, just redirect to projects
      router.push("/projects");
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "thumbnail.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href={projectId ? `/projects/${projectId}` : "/thumbnails"}
        className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {projectId ? "Back to Project" : "Back to Thumbnails"}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">AI Thumbnail Generator</h1>
        <p className="text-foreground-secondary mt-1">
          Create eye-catching thumbnails that get clicks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Thumbnail Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Describe your thumbnail *
              </label>
              <Textarea
                placeholder="e.g., A person looking shocked at a laptop screen with money flying around, bright and colorful background"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
              <p className="mt-1 text-xs text-foreground-tertiary">
                Be specific about emotions, colors, and composition
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Content Style
              </label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeText}
                  onChange={(e) => setIncludeText(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Include text overlay</span>
              </label>
              {includeText && (
                <Input
                  placeholder="e.g., $1000/day secret"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              )}
            </div>

            <Button
              onClick={handleGenerate}
              isLoading={isGenerating}
              className="w-full"
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              {isGenerating ? "Generating..." : "Generate Thumbnail"}
            </Button>

            <p className="text-xs text-foreground-tertiary text-center">
              Each generation creates a unique 1280x720 thumbnail
            </p>
          </CardContent>
        </Card>

        {/* Generated Thumbnails */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Thumbnails</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedImages.length > 0 ? (
              <div className="space-y-4">
                {/* Selected Thumbnail Preview */}
                {selectedIndex !== null && generatedImages[selectedIndex] && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary">
                    <Image
                      src={generatedImages[selectedIndex].url}
                      alt="Selected thumbnail"
                      fill
                      className="object-cover"
                    />
                    {generatedImages[selectedIndex].ctr_score && (
                      <div className="absolute top-2 left-2 bg-black/70 rounded px-2 py-1">
                        <span className="text-sm font-medium">
                          CTR Score:{" "}
                          <span className="text-success">
                            {generatedImages[selectedIndex].ctr_score}%
                          </span>
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        onClick={() =>
                          handleDownload(generatedImages[selectedIndex].url)
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Thumbnail Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {generatedImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedIndex(index)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        selectedIndex === index
                          ? "border-primary"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {selectedIndex === index && (
                        <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex-1"
                    leftIcon={
                      <RefreshCw
                        className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
                      />
                    }
                  >
                    Generate More
                  </Button>
                  <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    className="flex-1"
                    disabled={selectedIndex === null}
                  >
                    Use This Thumbnail
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Sparkles className="h-12 w-12 text-foreground-tertiary mb-4" />
                <p className="text-foreground-secondary">
                  Your thumbnails will appear here
                </p>
                <p className="text-sm text-foreground-tertiary mt-1">
                  Describe your ideal thumbnail and click Generate
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-warning/10 to-primary/10 border-warning/20">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-2">Tips for High-CTR Thumbnails</h3>
          <ul className="text-sm text-foreground-secondary space-y-1">
            <li>- Use bright, contrasting colors that stand out</li>
            <li>- Include faces with expressive emotions</li>
            <li>- Keep text large, bold, and minimal (max 3-4 words)</li>
            <li>- Create curiosity or promise value</li>
            <li>- Test multiple variations to see what works best</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
