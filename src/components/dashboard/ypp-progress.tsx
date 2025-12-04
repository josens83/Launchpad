"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Progress, CircularProgress } from "@/components/ui/progress";
import { HelpTooltip } from "@/components/ui/tooltip";
import { Trophy, Users, Clock } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface YPPProgressProps {
  subscribers: number;
  subscribersGoal?: number;
  watchHours: number;
  watchHoursGoal?: number;
}

export function YPPProgress({
  subscribers,
  subscribersGoal = 1000,
  watchHours,
  watchHoursGoal = 4000,
}: YPPProgressProps) {
  const subscriberPercentage = Math.min((subscribers / subscribersGoal) * 100, 100);
  const watchHoursPercentage = Math.min((watchHours / watchHoursGoal) * 100, 100);
  const overallProgress = (subscriberPercentage + watchHoursPercentage) / 2;
  const isEligible = subscribers >= subscribersGoal && watchHours >= watchHoursGoal;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>YPP Progress</CardTitle>
            <HelpTooltip
              content="YouTube Partner Program requirements: 1,000 subscribers and 4,000 watch hours in the last 12 months"
            />
          </div>
          {isEligible && (
            <div className="flex items-center gap-1 text-success">
              <Trophy className="h-5 w-5" />
              <span className="text-sm font-medium">Eligible!</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Overall Progress Circle */}
          <div className="flex flex-col items-center">
            <CircularProgress
              value={overallProgress}
              size={140}
              strokeWidth={10}
              variant={isEligible ? "success" : "default"}
            />
            <p className="mt-2 text-sm text-foreground-secondary">
              Overall Progress
            </p>
          </div>

          {/* Individual Progress Bars */}
          <div className="flex-1 w-full space-y-6">
            {/* Subscribers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-foreground-secondary" />
                  <span className="text-sm font-medium">Subscribers</span>
                </div>
                <span className="text-sm text-foreground-secondary">
                  {formatNumber(subscribers)} / {formatNumber(subscribersGoal)}
                </span>
              </div>
              <Progress
                value={subscribers}
                max={subscribersGoal}
                variant={subscribers >= subscribersGoal ? "success" : "default"}
                size="lg"
              />
              {subscribers < subscribersGoal && (
                <p className="mt-1 text-xs text-foreground-tertiary">
                  {formatNumber(subscribersGoal - subscribers)} more subscribers needed
                </p>
              )}
            </div>

            {/* Watch Hours */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-foreground-secondary" />
                  <span className="text-sm font-medium">Watch Hours</span>
                </div>
                <span className="text-sm text-foreground-secondary">
                  {formatNumber(watchHours)} / {formatNumber(watchHoursGoal)}
                </span>
              </div>
              <Progress
                value={watchHours}
                max={watchHoursGoal}
                variant={watchHours >= watchHoursGoal ? "success" : "default"}
                size="lg"
              />
              {watchHours < watchHoursGoal && (
                <p className="mt-1 text-xs text-foreground-tertiary">
                  {formatNumber(watchHoursGoal - watchHours)} more watch hours needed
                </p>
              )}
            </div>
          </div>
        </div>

        {!isEligible && (
          <div className="mt-6 p-4 rounded-lg bg-background-tertiary">
            <p className="text-sm text-foreground-secondary">
              <strong>Tip:</strong> Focus on creating consistent content and promoting your videos
              to grow your subscriber base and watch time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
