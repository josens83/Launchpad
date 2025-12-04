"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  Plus,
  FileText,
  Image,
  Search,
  Lightbulb,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const actions = [
  {
    title: "New Project",
    description: "Start a new video project",
    href: "/projects/new",
    icon: Plus,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Generate Script",
    description: "AI-powered script writing",
    href: "/scripts/new",
    icon: FileText,
    color: "bg-secondary/10 text-secondary",
  },
  {
    title: "Create Thumbnail",
    description: "Design eye-catching thumbnails",
    href: "/thumbnails/new",
    icon: Image,
    color: "bg-success/10 text-success",
  },
  {
    title: "Keyword Research",
    description: "Find trending keywords",
    href: "/seo/keywords",
    icon: Search,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Get Ideas",
    description: "AI content suggestions",
    href: "/ideas",
    icon: Lightbulb,
    color: "bg-info/10 text-info",
  },
  {
    title: "View Analytics",
    description: "Track your performance",
    href: "/analytics",
    icon: TrendingUp,
    color: "bg-error/10 text-error",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex flex-col p-4 rounded-lg bg-background-secondary hover:bg-surface-hover transition-colors"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg mb-3",
                  action.color
                )}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                {action.title}
              </h4>
              <p className="text-xs text-foreground-secondary mt-1">
                {action.description}
              </p>
              <ArrowRight className="h-4 w-4 mt-2 text-foreground-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
