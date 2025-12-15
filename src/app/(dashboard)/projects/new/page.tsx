"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardContent,
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Sparkles, Calendar } from "lucide-react";
import Link from "next/link";

const niches = [
  "Gaming",
  "Technology",
  "Education",
  "Entertainment",
  "Lifestyle",
  "Fitness",
  "Cooking",
  "Travel",
  "Music",
  "Business",
  "Science",
  "Art & Design",
  "Comedy",
  "News",
  "Reviews",
  "Tutorials",
  "Vlogs",
  "Other",
];

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useUserStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [niche, setNiche] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a project title");
      return;
    }

    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: dbError } = await supabase
      .from("projects")
      .insert({
        user_id: user?.id,
        title: title.trim(),
        description: description.trim() || null,
        scheduled_date: scheduledDate || null,
        status: "idea",
      })
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
      setIsLoading(false);
      return;
    }

    router.push(`/projects/${data.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Create New Project</h1>
        <p className="text-foreground-secondary mt-1">
          Start a new video project and bring your ideas to life
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Project Title *
              </label>
              <Input
                placeholder="e.g., How to Build a YouTube Channel in 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-foreground-tertiary">
                This can be your video title or a working title
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                placeholder="Brief description of your video idea..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Niche</label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your content niche" />
                </SelectTrigger>
                <SelectContent>
                  {niches.map((n) => (
                    <SelectItem key={n} value={n.toLowerCase()}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Scheduled Date
              </label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="mt-1 text-xs text-foreground-tertiary">
                When do you plan to publish this video?
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                isLoading={isLoading}
                className="flex-1"
              >
                Create Project
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/projects")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* AI Suggestion Card */}
      <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Need ideas?</h3>
              <p className="text-sm text-foreground-secondary mb-3">
                Our AI can help you brainstorm video ideas based on trending
                topics in your niche.
              </p>
              <Link href="/ideas">
                <Button variant="secondary" size="sm">
                  Get AI Ideas
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
