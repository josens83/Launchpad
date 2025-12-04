"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores";
import {
  StatsCard,
  YPPProgress,
  QuickActions,
  ProjectCard,
} from "@/components/dashboard";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Eye, Clock, MousePointer, Users, Plus, ArrowRight } from "lucide-react";
import type { Project } from "@/types";

export default function DashboardPage() {
  const { user } = useUserStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("projects")
        .select("*, scripts(*), thumbnails(*)")
        .order("updated_at", { ascending: false })
        .limit(4);

      if (data) {
        setProjects(data);
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, []);

  // Mock analytics data - would come from YouTube API in production
  const analyticsData = {
    views: 12500,
    viewsChange: 15.2,
    watchTime: 850,
    watchTimeChange: 8.5,
    ctr: 4.8,
    ctrChange: -0.3,
    subscribers: 342,
    subscribersChange: 12,
  };

  const yppData = {
    subscribers: 342,
    watchHours: 1250,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(" ")[0] || "Creator"}!
          </h1>
          <p className="text-foreground-secondary mt-1">
            Here&apos;s what&apos;s happening with your channel
          </p>
        </div>
        <Link href="/projects/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Project</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Views"
          value={analyticsData.views.toLocaleString()}
          change={analyticsData.viewsChange}
          changeLabel="vs last month"
          icon={<Eye className="h-5 w-5 text-foreground-secondary" />}
          tooltip="Total video views across all your content"
          status={analyticsData.viewsChange > 0 ? "good" : "bad"}
        />
        <StatsCard
          title="Watch Time"
          value={`${analyticsData.watchTime}h`}
          change={analyticsData.watchTimeChange}
          changeLabel="vs last month"
          icon={<Clock className="h-5 w-5 text-foreground-secondary" />}
          tooltip="Total hours viewers spent watching your content"
          status={analyticsData.watchTimeChange > 0 ? "good" : "bad"}
        />
        <StatsCard
          title="Click Rate"
          value={`${analyticsData.ctr}%`}
          change={analyticsData.ctrChange}
          changeLabel="vs last month"
          icon={<MousePointer className="h-5 w-5 text-foreground-secondary" />}
          tooltip="Percentage of impressions that resulted in clicks"
          status={
            analyticsData.ctr >= 4
              ? "good"
              : analyticsData.ctr >= 2
              ? "warning"
              : "bad"
          }
        />
        <StatsCard
          title="Subscribers"
          value={analyticsData.subscribers.toLocaleString()}
          change={analyticsData.subscribersChange}
          changeLabel="this month"
          icon={<Users className="h-5 w-5 text-foreground-secondary" />}
          tooltip="Your current subscriber count"
          status={analyticsData.subscribersChange > 0 ? "good" : "warning"}
        />
      </div>

      {/* YPP Progress */}
      <YPPProgress
        subscribers={yppData.subscribers}
        watchHours={yppData.watchHours}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Projects</CardTitle>
          <Link href="/projects">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-video rounded-lg bg-background-tertiary animate-pulse"
                />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-foreground-secondary mb-4">
                No projects yet. Create your first video project!
              </p>
              <Link href="/projects/new">
                <Button leftIcon={<Plus className="h-4 w-4" />}>
                  Create Project
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips for beginners */}
      {user?.plan === "free" && (
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Ready to grow faster?
                </h3>
                <p className="text-foreground-secondary text-sm">
                  Upgrade to Pro for unlimited scripts, thumbnails, and advanced
                  analytics to supercharge your YouTube journey.
                </p>
              </div>
              <Link href="/settings/billing">
                <Button>Upgrade to Pro</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
