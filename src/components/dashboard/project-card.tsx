"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/format";
import type { Project, ProjectStatus } from "@/types";
import {
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Calendar,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; variant: "default" | "secondary" | "success" | "warning" }
> = {
  idea: { label: "Idea", variant: "default" },
  scripting: { label: "Scripting", variant: "secondary" },
  editing: { label: "Editing", variant: "warning" },
  review: { label: "Review", variant: "secondary" },
  published: { label: "Published", variant: "success" },
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const status = statusConfig[project.status];
  const selectedThumbnail = project.thumbnails?.find((t) => t.is_selected);
  const hasScript = project.scripts && project.scripts.length > 0;
  const hasThumbnail = project.thumbnails && project.thumbnails.length > 0;

  return (
    <Card hover className="group relative overflow-hidden">
      {/* Thumbnail Preview */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-background-tertiary mb-4">
        {selectedThumbnail ? (
          <Image
            src={selectedThumbnail.image_url}
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-foreground-tertiary" />
          </div>
        )}
        {project.status === "published" && project.youtube_url && (
          <a
            href={project.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="h-12 w-12 text-white" fill="white" />
          </a>
        )}
      </div>

      {/* Content */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/projects/${project.id}`}
            className="flex-1 hover:underline"
          >
            <h3 className="font-semibold text-foreground line-clamp-2">
              {project.title}
            </h3>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(project.id)}
                  className="text-error"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Badge variant={status.variant}>{status.label}</Badge>
          {project.scheduled_date && (
            <div className="flex items-center gap-1 text-xs text-foreground-secondary">
              <Calendar className="h-3 w-3" />
              <span>{project.scheduled_date}</span>
            </div>
          )}
        </div>

        {/* Progress Indicators */}
        <div className="mt-3 flex items-center gap-4 text-xs text-foreground-secondary">
          <div
            className={cn(
              "flex items-center gap-1",
              hasScript && "text-success"
            )}
          >
            <FileText className="h-3 w-3" />
            <span>{hasScript ? "Script done" : "No script"}</span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1",
              hasThumbnail && "text-success"
            )}
          >
            <ImageIcon className="h-3 w-3" />
            <span>{hasThumbnail ? "Thumbnail ready" : "No thumbnail"}</span>
          </div>
        </div>

        <p className="mt-2 text-xs text-foreground-tertiary">
          Updated {formatRelativeTime(project.updated_at)}
        </p>
      </div>
    </Card>
  );
}
