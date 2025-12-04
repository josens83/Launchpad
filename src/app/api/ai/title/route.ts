import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateTitle } from "@/lib/ai/claude";

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
    const { topic, keywords, language } = body;

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    // Generate titles using Claude
    const titles = await generateTitle(
      topic,
      keywords || [],
      language || "en"
    );

    // Update usage
    await supabase.rpc("increment_usage", {
      p_user_id: user.id,
      p_type: "title",
      p_count: 1,
    });

    return NextResponse.json({ titles });
  } catch (error) {
    console.error("Title generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate titles" },
      { status: 500 }
    );
  }
}
