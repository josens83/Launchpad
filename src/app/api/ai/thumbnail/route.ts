import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateThumbnail, analyzeThumbnailCTR } from "@/lib/ai/openai";
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
      .eq("type", "thumbnail")
      .eq("month", currentMonth)
      .single();

    const currentCount = usage?.count || 0;
    if (limits.thumbnails_per_month !== -1 && currentCount >= limits.thumbnails_per_month) {
      return NextResponse.json(
        { error: "Monthly thumbnail limit reached. Please upgrade your plan." },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { prompt, project_id } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Generate thumbnail using DALL-E
    const imageUrl = await generateThumbnail(prompt);

    // Analyze CTR potential
    let ctrScore = null;
    try {
      const analysis = await analyzeThumbnailCTR(imageUrl);
      ctrScore = analysis.score;
    } catch (err) {
      console.error("CTR analysis error:", err);
    }

    // Save to database if project_id provided
    let thumbnailId = null;
    if (project_id) {
      const { data: thumbnail } = await supabase
        .from("thumbnails")
        .insert({
          project_id,
          image_url: imageUrl,
          prompt,
          ctr_score: ctrScore,
        })
        .select()
        .single();

      thumbnailId = thumbnail?.id;
    }

    // Update usage
    await supabase.rpc("increment_usage", {
      p_user_id: user.id,
      p_type: "thumbnail",
      p_count: 1,
    });

    return NextResponse.json({
      image_url: imageUrl,
      ctr_score: ctrScore,
      thumbnail_id: thumbnailId,
    });
  } catch (error) {
    console.error("Thumbnail generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate thumbnail" },
      { status: 500 }
    );
  }
}
