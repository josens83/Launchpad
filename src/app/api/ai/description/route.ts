import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDescription } from "@/lib/ai/claude";

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

    // Parse request body
    const body = await request.json();
    const { title, script_summary, keywords, include_timestamps, language } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate description using Claude
    const description = await generateDescription(
      title,
      script_summary || "",
      keywords || [],
      include_timestamps !== false,
      language || "en"
    );

    // Update usage
    await supabase.rpc("increment_usage", {
      p_user_id: user.id,
      p_type: "description",
      p_count: 1,
    });

    return NextResponse.json({ description });
  } catch (error) {
    console.error("Description generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}
