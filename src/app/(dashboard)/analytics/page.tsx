"use client";

import { useState } from "react";
import {
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
import { StatsCard } from "@/components/dashboard";
import { HelpTooltip } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  Clock,
  MousePointer,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Play,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

// Mock data - would come from YouTube API
const mockAnalytics = {
  overview: {
    views: 125000,
    viewsChange: 12.5,
    watchTime: 8500,
    watchTimeChange: 8.2,
    ctr: 5.2,
    ctrChange: 0.4,
    subscribers: 2340,
    subscribersChange: 156,
    revenue: 342.5,
    revenueChange: 15.3,
  },
  videos: [
    {
      id: "1",
      title: "10 Productivity Tips That Changed My Life",
      views: 45000,
      ctr: 6.8,
      avgViewDuration: 420,
      retention: 52,
      published: "2024-01-15",
    },
    {
      id: "2",
      title: "How I Built a 6-Figure Business",
      views: 32000,
      ctr: 5.4,
      avgViewDuration: 380,
      retention: 48,
      published: "2024-01-10",
    },
    {
      id: "3",
      title: "Morning Routine for Success",
      views: 28000,
      ctr: 4.9,
      avgViewDuration: 340,
      retention: 45,
      published: "2024-01-05",
    },
    {
      id: "4",
      title: "Best Tools for Content Creators",
      views: 15000,
      ctr: 4.2,
      avgViewDuration: 290,
      retention: 40,
      published: "2024-01-01",
    },
  ],
  demographics: {
    age: [
      { range: "18-24", percentage: 28 },
      { range: "25-34", percentage: 42 },
      { range: "35-44", percentage: 18 },
      { range: "45-54", percentage: 8 },
      { range: "55+", percentage: 4 },
    ],
    countries: [
      { country: "United States", percentage: 35 },
      { country: "India", percentage: 18 },
      { country: "United Kingdom", percentage: 12 },
      { country: "Canada", percentage: 8 },
      { country: "Australia", percentage: 6 },
    ],
  },
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("28d");

  const getStatusForCTR = (ctr: number) => {
    if (ctr >= 5) return "good";
    if (ctr >= 3) return "warning";
    return "bad";
  };

  const getStatusForRetention = (retention: number) => {
    if (retention >= 50) return "good";
    if (retention >= 30) return "warning";
    return "bad";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-foreground-secondary mt-1">
            Track your channel performance and growth
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="28d">Last 28 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="365d">Last 365 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Views"
          value={formatNumber(mockAnalytics.overview.views)}
          change={mockAnalytics.overview.viewsChange}
          icon={<Eye className="h-5 w-5 text-foreground-secondary" />}
          tooltip="Total video views in the selected period"
          status={mockAnalytics.overview.viewsChange > 0 ? "good" : "bad"}
        />
        <StatsCard
          title="Watch Time"
          value={`${formatNumber(mockAnalytics.overview.watchTime)}h`}
          change={mockAnalytics.overview.watchTimeChange}
          icon={<Clock className="h-5 w-5 text-foreground-secondary" />}
          tooltip="Total hours watched"
          status={mockAnalytics.overview.watchTimeChange > 0 ? "good" : "bad"}
        />
        <StatsCard
          title="CTR"
          value={`${mockAnalytics.overview.ctr}%`}
          change={mockAnalytics.overview.ctrChange}
          icon={<MousePointer className="h-5 w-5 text-foreground-secondary" />}
          tooltip="Click-through rate from impressions"
          status={getStatusForCTR(mockAnalytics.overview.ctr)}
        />
        <StatsCard
          title="Subscribers"
          value={formatNumber(mockAnalytics.overview.subscribers)}
          change={mockAnalytics.overview.subscribersChange}
          changeLabel="new"
          icon={<Users className="h-5 w-5 text-foreground-secondary" />}
          tooltip="Total subscriber count"
          status="good"
        />
        <StatsCard
          title="Revenue"
          value={`$${mockAnalytics.overview.revenue.toFixed(2)}`}
          change={mockAnalytics.overview.revenueChange}
          icon={<DollarSign className="h-5 w-5 text-foreground-secondary" />}
          tooltip="Estimated revenue from ads"
          status={mockAnalytics.overview.revenueChange > 0 ? "good" : "warning"}
        />
      </div>

      {/* Performance by Video */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalytics.videos.map((video, index) => (
              <div
                key={video.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-background-secondary"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{video.title}</h4>
                  <p className="text-sm text-foreground-secondary">
                    Published {video.published}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium">{formatNumber(video.views)}</p>
                    <p className="text-foreground-tertiary text-xs">Views</p>
                  </div>
                  <div className="text-center">
                    <p
                      className={`font-medium ${
                        getStatusForCTR(video.ctr) === "good"
                          ? "text-success"
                          : getStatusForCTR(video.ctr) === "warning"
                          ? "text-warning"
                          : "text-error"
                      }`}
                    >
                      {video.ctr}%
                    </p>
                    <p className="text-foreground-tertiary text-xs">CTR</p>
                  </div>
                  <div className="text-center">
                    <p
                      className={`font-medium ${
                        getStatusForRetention(video.retention) === "good"
                          ? "text-success"
                          : getStatusForRetention(video.retention) === "warning"
                          ? "text-warning"
                          : "text-error"
                      }`}
                    >
                      {video.retention}%
                    </p>
                    <p className="text-foreground-tertiary text-xs">Retention</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Age Distribution</CardTitle>
              <HelpTooltip content="Age breakdown of your viewers" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAnalytics.demographics.age.map((item) => (
              <div key={item.range}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{item.range}</span>
                  <span className="text-sm text-foreground-secondary">
                    {item.percentage}%
                  </span>
                </div>
                <Progress value={item.percentage} max={100} size="sm" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Top Countries</CardTitle>
              <HelpTooltip content="Where your viewers are located" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAnalytics.demographics.countries.map((item) => (
              <div key={item.country}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{item.country}</span>
                  <span className="text-sm text-foreground-secondary">
                    {item.percentage}%
                  </span>
                </div>
                <Progress value={item.percentage} max={100} size="sm" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Insights Card */}
      <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-4">AI Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-success mt-0.5" />
              <p className="text-sm text-foreground-secondary">
                Your CTR is above average for your niche. Keep creating
                eye-catching thumbnails!
              </p>
            </div>
            <div className="flex items-start gap-3">
              <TrendingDown className="h-5 w-5 text-warning mt-0.5" />
              <p className="text-sm text-foreground-secondary">
                Average view duration dropped 8% this month. Consider adding
                more engaging hooks in the first 30 seconds.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Play className="h-5 w-5 text-secondary mt-0.5" />
              <p className="text-sm text-foreground-secondary">
                Videos posted on Tuesdays and Thursdays perform 23% better for
                your audience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
