"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Input,
  Textarea,
} from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Search,
  Video,
  Edit,
  Trash2,
  Plus,
  Sparkles,
  ExternalLink,
  Loader2,
  Check,
  Copy,
} from "lucide-react";
import type { Project, ProjectStatus, Script, Thumbnail, Keyword } from "@/types";
import { formatRelativeTime, formatDuration } from "@/lib/utils";

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "scripting", label: "Scripting" },
  { value: "editing", label: "Editing" },
  { value: "review", label: "Review" },
  { value: "published", label: "Published" },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projects")
        .select("*, scripts(*), thumbnails(*), keywords(*)")
        .eq("id", projectId)
        .single();

      if (error || !data) {
        router.push("/projects");
        return;
      }

      setProject(data);
      setIsLoading(false);
    };

    fetchProject();
  }, [projectId, router]);

  const updateProject = async (updates: Partial<Project>) => {
    if (!project) return;

    setIsSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", projectId);

    if (!error) {
      setProject({ ...project, ...updates });
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    const supabase = createClient();
    await supabase.from("projects").delete().eq("id", projectId);
    router.push("/projects");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const currentScript = project.scripts?.[0];
  const selectedThumbnail = project.thumbnails?.find((t) => t.is_selected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Select
              value={project.status}
              onValueChange={(value) =>
                updateProject({ status: value as ProjectStatus })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-foreground-secondary">
              Updated {formatRelativeTime(project.updated_at)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDelete}
            className="text-error"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {project.youtube_url && (
            <Button variant="outline" asChild>
              <a
                href={project.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on YouTube
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="script">Script</TabsTrigger>
          <TabsTrigger value="thumbnails">Thumbnails</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add a description for your video..."
                    value={project.description || ""}
                    onChange={(e) => updateProject({ description: e.target.value })}
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link href={`/scripts/new?project=${projectId}`}>
                  <Card hover className="h-full cursor-pointer text-center py-6">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-secondary" />
                    <p className="text-sm font-medium">Write Script</p>
                  </Card>
                </Link>
                <Link href={`/thumbnails/new?project=${projectId}`}>
                  <Card hover className="h-full cursor-pointer text-center py-6">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-success" />
                    <p className="text-sm font-medium">Create Thumbnail</p>
                  </Card>
                </Link>
                <Link href={`/seo?project=${projectId}`}>
                  <Card hover className="h-full cursor-pointer text-center py-6">
                    <Search className="h-8 w-8 mx-auto mb-2 text-warning" />
                    <p className="text-sm font-medium">SEO Tools</p>
                  </Card>
                </Link>
                <Link href={`/editor?project=${projectId}`}>
                  <Card hover className="h-full cursor-pointer text-center py-6">
                    <Video className="h-8 w-8 mx-auto mb-2 text-error" />
                    <p className="text-sm font-medium">Edit Video</p>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Thumbnail Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Thumbnail</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedThumbnail ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={selectedThumbnail.image_url}
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg bg-background-tertiary flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 text-foreground-tertiary" />
                        <p className="text-sm text-foreground-secondary">
                          No thumbnail yet
                        </p>
                        <Link href={`/thumbnails/new?project=${projectId}`}>
                          <Button size="sm" className="mt-2">
                            Create One
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Script Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Script</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentScript ? (
                    <div>
                      <p className="text-sm text-foreground-secondary line-clamp-4">
                        {currentScript.content}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div className="text-xs text-foreground-tertiary">
                          {currentScript.word_count} words •{" "}
                          {formatDuration(currentScript.estimated_duration)}
                        </div>
                        <Link href={`/scripts/${currentScript.id}`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-foreground-tertiary" />
                      <p className="text-sm text-foreground-secondary">
                        No script yet
                      </p>
                      <Link href={`/scripts/new?project=${projectId}`}>
                        <Button size="sm" className="mt-2">
                          Write Script
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Script Tab */}
        <TabsContent value="script">
          {currentScript ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Script</CardTitle>
                  <p className="text-sm text-foreground-secondary mt-1">
                    {currentScript.word_count} words •{" "}
                    {formatDuration(currentScript.estimated_duration)} estimated
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Link href={`/scripts/${currentScript.id}`}>
                    <Button size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {currentScript.content}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="py-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-foreground-tertiary" />
              <h3 className="text-lg font-semibold mb-2">No script yet</h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                Create a compelling script for your video using our AI-powered
                script generator
              </p>
              <Link href={`/scripts/new?project=${projectId}`}>
                <Button leftIcon={<Sparkles className="h-4 w-4" />}>
                  Generate Script with AI
                </Button>
              </Link>
            </Card>
          )}
        </TabsContent>

        {/* Thumbnails Tab */}
        <TabsContent value="thumbnails">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Thumbnails</CardTitle>
              <Link href={`/thumbnails/new?project=${projectId}`}>
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                  Create New
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {project.thumbnails && project.thumbnails.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {project.thumbnails.map((thumbnail) => (
                    <div
                      key={thumbnail.id}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        thumbnail.is_selected
                          ? "border-primary"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <Image
                        src={thumbnail.image_url}
                        alt="Thumbnail option"
                        fill
                        className="object-cover"
                      />
                      {thumbnail.is_selected && (
                        <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {thumbnail.ctr_score && (
                        <div className="absolute bottom-2 left-2 bg-black/70 rounded px-2 py-1 text-xs">
                          CTR: {thumbnail.ctr_score}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 text-foreground-tertiary" />
                  <h3 className="text-lg font-semibold mb-2">
                    No thumbnails yet
                  </h3>
                  <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                    Create eye-catching thumbnails to boost your click-through
                    rate
                  </p>
                  <Link href={`/thumbnails/new?project=${projectId}`}>
                    <Button leftIcon={<Sparkles className="h-4 w-4" />}>
                      Generate Thumbnail with AI
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                {project.keywords && project.keywords.length > 0 ? (
                  <div className="space-y-2">
                    {project.keywords.map((keyword) => (
                      <div
                        key={keyword.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-background-secondary"
                      >
                        <span className="font-medium">{keyword.keyword}</span>
                        <div className="flex items-center gap-2">
                          {keyword.search_volume && (
                            <span className="text-xs text-foreground-secondary">
                              {keyword.search_volume.toLocaleString()} searches
                            </span>
                          )}
                          {keyword.competition && (
                            <Badge
                              variant={
                                keyword.competition === "low"
                                  ? "success"
                                  : keyword.competition === "high"
                                  ? "error"
                                  : "warning"
                              }
                            >
                              {keyword.competition}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Search className="h-12 w-12 mx-auto mb-2 text-foreground-tertiary" />
                    <p className="text-foreground-secondary">
                      No keywords researched yet
                    </p>
                    <Link href={`/seo?project=${projectId}`}>
                      <Button size="sm" className="mt-4">
                        Research Keywords
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      label: "Title optimized",
                      done: project.title.length >= 30 && project.title.length <= 60,
                    },
                    {
                      label: "Description written",
                      done: !!project.description,
                    },
                    {
                      label: "Keywords researched",
                      done: project.keywords && project.keywords.length > 0,
                    },
                    {
                      label: "Thumbnail created",
                      done: project.thumbnails && project.thumbnails.length > 0,
                    },
                    {
                      label: "Tags added",
                      done: project.tags && project.tags.length > 0,
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center ${
                          item.done ? "bg-success" : "bg-background-tertiary"
                        }`}
                      >
                        {item.done && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span
                        className={
                          item.done
                            ? "text-foreground"
                            : "text-foreground-secondary"
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
