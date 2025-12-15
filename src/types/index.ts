// User Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: PlanType;
  plan_expires_at: string | null;
  language: string;
  timezone: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export type PlanType = "free" | "starter" | "pro" | "team";

export interface PlanLimits {
  scripts_per_month: number;
  thumbnails_per_month: number;
  caption_minutes_per_month: number;
  has_watermark: boolean;
  advanced_analytics: boolean;
  competitor_analysis: boolean;
  team_members: number;
  api_access: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    scripts_per_month: 3,
    thumbnails_per_month: 5,
    caption_minutes_per_month: 0,
    has_watermark: true,
    advanced_analytics: false,
    competitor_analysis: false,
    team_members: 1,
    api_access: false,
  },
  starter: {
    scripts_per_month: 20,
    thumbnails_per_month: 30,
    caption_minutes_per_month: 60,
    has_watermark: false,
    advanced_analytics: false,
    competitor_analysis: false,
    team_members: 1,
    api_access: false,
  },
  pro: {
    scripts_per_month: -1, // unlimited
    thumbnails_per_month: -1, // unlimited
    caption_minutes_per_month: 300,
    has_watermark: false,
    advanced_analytics: true,
    competitor_analysis: true,
    team_members: 1,
    api_access: false,
  },
  team: {
    scripts_per_month: -1, // unlimited
    thumbnails_per_month: -1, // unlimited
    caption_minutes_per_month: -1, // unlimited
    has_watermark: false,
    advanced_analytics: true,
    competitor_analysis: true,
    team_members: 5,
    api_access: true,
  },
};

// Channel Types
export interface Channel {
  id: string;
  user_id: string;
  youtube_channel_id: string | null;
  channel_name: string | null;
  niche: string | null;
  subscriber_count: number;
  created_at: string;
}

// Project Types
export type ProjectStatus = "idea" | "scripting" | "editing" | "review" | "published";

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  scheduled_date: string | null;
  youtube_video_id: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  // Relations
  scripts?: Script[];
  thumbnails?: Thumbnail[];
  keywords?: Keyword[];
}

// Script Types
export interface Script {
  id: string;
  project_id: string;
  content: string;
  word_count: number;
  estimated_duration: number; // in seconds
  version: number;
  created_at: string;
}

export interface ScriptSection {
  type: "hook" | "intro" | "main" | "outro" | "cta";
  content: string;
  duration?: number;
}

// Thumbnail Types
export interface Thumbnail {
  id: string;
  project_id: string;
  image_url: string;
  prompt: string | null;
  ctr_score: number | null;
  is_selected: boolean;
  created_at: string;
}

// Keyword Types
export type CompetitionLevel = "low" | "medium" | "high";

export interface Keyword {
  id: string;
  project_id: string;
  keyword: string;
  search_volume: number | null;
  competition: CompetitionLevel | null;
  created_at: string;
}

// Usage Types
export type UsageType = "script" | "thumbnail" | "caption";

export interface Usage {
  id: string;
  user_id: string;
  type: UsageType;
  count: number;
  month: string; // Format: 'YYYY-MM'
  created_at: string;
}

// Analytics Types
export interface AnalyticsData {
  views: number;
  watch_time_hours: number;
  ctr: number;
  avg_view_duration: number;
  subscribers_gained: number;
  subscribers_lost: number;
  revenue: number;
}

export interface VideoAnalytics {
  video_id: string;
  title: string;
  views: number;
  ctr: number;
  avg_view_duration: number;
  retention_rate: number;
  published_at: string;
}

// YPP Progress Types
export interface YPPProgress {
  subscribers: number;
  subscribers_goal: number;
  watch_hours: number;
  watch_hours_goal: number;
  subscribers_percentage: number;
  watch_hours_percentage: number;
  is_eligible: boolean;
}

// Content Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  status: ProjectStatus;
  project_id: string;
}

// AI Generation Types
export type ToneType = "casual" | "professional" | "educational" | "entertaining" | "inspirational" | "conversational";

export interface ScriptGenerationRequest {
  topic: string;
  niche: string;
  tone: ToneType;
  target_duration: number; // in minutes
  include_hook: boolean;
  include_cta: boolean;
  language: string;
}

export interface ScriptGenerationResponse {
  script: string;
  sections: ScriptSection[];
  word_count: number;
  estimated_duration: number;
}

export interface ThumbnailGenerationRequest {
  title: string;
  style: "gaming" | "vlog" | "tutorial" | "review" | "news" | "entertainment";
  color_scheme?: string;
  include_text: boolean;
  text_content?: string;
}

export interface TitleSuggestion {
  title: string;
  seo_score: number;
  ctr_prediction: number;
}

export interface DescriptionGenerationRequest {
  title: string;
  script_summary: string;
  keywords: string[];
  include_timestamps: boolean;
  language: string;
}

// SEO Types
export interface SEOScore {
  overall: number;
  title_score: number;
  description_score: number;
  tags_score: number;
  suggestions: string[];
}

// Onboarding Types
export interface OnboardingData {
  niche: string;
  experience_level: "beginner" | "intermediate" | "advanced";
  content_frequency: "daily" | "weekly" | "biweekly" | "monthly";
  goals: string[];
  preferred_language: string;
}

// Notification Types
export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
