import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateScript } from "@/lib/ai/claude";
import { PLAN_LIMITS } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user plan
    const { data: profile } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    const plan = profile?.plan || "free";
    const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];

    // Check usage limits
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: usage } = await supabase
      .from("usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("type", "script")
      .eq("month", currentMonth)
      .single();

    const currentCount = usage?.count || 0;
    if (limits.scripts_per_month !== -1 && currentCount >= limits.scripts_per_month) {
      return NextResponse.json(
        { error: "Monthly script limit reached. Please upgrade your plan." },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      topic,
      niche,
      tone,
      target_duration,
      include_hook,
      include_cta,
      language,
    } = body;

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    // Generate script using Claude
    const result = await generateScript({
      topic,
      niche: niche || "general",
      tone: tone || "casual",
      target_duration: target_duration || 10,
      include_hook: include_hook !== false,
      include_cta: include_cta !== false,
      language: language || "en",
    });

    // Update usage
    await supabase.rpc("increment_usage", {
      p_user_id: user.id,
      p_type: "script",
      p_count: 1,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
}
