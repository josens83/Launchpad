"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ProjectCard } from "@/components/dashboard";
import { Button, Card, Input } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Grid, List, Loader2 } from "lucide-react";
import type { Project, ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusFilters: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All Projects" },
  { value: "idea", label: "Ideas" },
  { value: "scripting", label: "Scripting" },
  { value: "editing", label: "Editing" },
  { value: "review", label: "Review" },
  { value: "published", label: "Published" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient();
      let query = supabase
        .from("projects")
        .select("*, scripts(*), thumbnails(*)")
        .order("updated_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      const { data } = await query;

      if (data) {
        setProjects(data);
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, [statusFilter, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    const supabase = createClient();
    await supabase.from("projects").delete().eq("id", id);
    setProjects(projects.filter((p) => p.id !== id));
  };

  const filteredProjects = projects.filter((project) => {
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== "all" && project.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-foreground-secondary mt-1">
            Manage all your video projects in one place
          </p>
        </div>
        <Link href="/projects/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Project</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ProjectStatus | "all")}
            >
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border border-border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              statusFilter === filter.value
                ? "bg-primary text-white"
                : "bg-background-secondary text-foreground-secondary hover:bg-surface-hover"
            )}
          >
            {filter.label}
            {filter.value !== "all" && (
              <span className="ml-2 text-xs">
                ({projects.filter((p) => filter.value === "all" || p.status === filter.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Projects Grid/List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-4"
          )}
        >
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-foreground-secondary mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "Get started by creating your first video project"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/projects/new">
                <Button leftIcon={<Plus className="h-4 w-4" />}>
                  Create Your First Project
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
