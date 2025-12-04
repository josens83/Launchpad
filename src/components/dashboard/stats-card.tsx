"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui";
import { HelpTooltip } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  status?: "good" | "warning" | "bad" | "neutral";
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  tooltip,
  status = "neutral",
  className,
}: StatsCardProps) {
  const statusColors = {
    good: "text-success",
    warning: "text-warning",
    bad: "text-error",
    neutral: "text-foreground-secondary",
  };

  const statusIndicators = {
    good: "bg-success",
    warning: "bg-warning",
    bad: "bg-error",
    neutral: "bg-foreground-tertiary",
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Status indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1",
          statusIndicators[status]
        )}
      />

      <div className="pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-foreground-secondary">
              {title}
            </span>
            {tooltip && <HelpTooltip content={tooltip} />}
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-tertiary">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-2">
          <span className="text-2xl font-bold text-foreground">{value}</span>
        </div>

        {change !== undefined && (
          <div className="mt-2 flex items-center gap-1">
            {change > 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : change < 0 ? (
              <TrendingDown className="h-4 w-4 text-error" />
            ) : (
              <Minus className="h-4 w-4 text-foreground-tertiary" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                change > 0
                  ? "text-success"
                  : change < 0
                  ? "text-error"
                  : "text-foreground-tertiary"
              )}
            >
              {change > 0 ? "+" : ""}
              {change}%
            </span>
            {changeLabel && (
              <span className="text-sm text-foreground-tertiary">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
