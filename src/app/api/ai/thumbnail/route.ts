/**
 * Thumbnail Generation API Route
 * POST /api/ai/thumbnail
 *
 * Features:
 * - Input validation with Zod
 * - Rate limiting
 * - Error handling with structured errors
 * - Usage tracking
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateThumbnail, analyzeThumbnailCTR } from "@/lib/ai/openai";
import { PLAN_LIMITS } from "@/types";

// Error handling
import { handleApiError, createSuccessResponse } from "@/lib/errors/handler";
import { ForbiddenError } from "@/lib/errors/api";
import { ValidationError } from "@/lib/errors/validation";
import { AuthenticationError } from "@/lib/errors/auth";
import { ThumbnailGenerationError } from "@/lib/errors/ai";

// Rate limiting
import { withRateLimit } from "@/lib/rate-limit";

// Validation
import { thumbnailGenerationSchema } from "@/lib/validation/schemas/thumbnail";
import { sanitizeText } from "@/lib/validation/sanitize";

export async function POST(request: NextRequest) {
  return withRateLimit(request, async () => {
    try {
      const supabase = await createClient();

      // ============================================
      // Authentication Check
      // ============================================
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new AuthenticationError('Authentication required');
      }

      // ============================================
      // Get User Plan
      // ============================================
      const { data: profile } = await supabase
        .from("users")
        .select("plan")
        .eq("id", user.id)
        .single();

      const plan = profile?.plan || "free";
      const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];

      // ============================================
      // Check Monthly Usage Limits
      // ============================================
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
        throw new ForbiddenError(
          `Monthly thumbnail limit of ${limits.thumbnails_per_month} reached. Please upgrade your plan.`
        );
      }

      // ============================================
      // Parse and Validate Request Body
      // ============================================
      let body;
      try {
        body = await request.json();
      } catch {
        throw new ValidationError('Invalid JSON body');
      }

      // Validate with Zod schema
      const validationResult = thumbnailGenerationSchema.safeParse(body);
      if (!validationResult.success) {
        throw ValidationError.fromZodError(validationResult.error);
      }

      const validatedData = validationResult.data;

      // Sanitize text inputs
      const sanitizedPrompt = sanitizeText(validatedData.prompt);
      const sanitizedTextOverlay = validatedData.text_overlay
        ? sanitizeText(validatedData.text_overlay)
        : undefined;

      // ============================================
      // Generate Thumbnail
      // ============================================
      let imageUrl: string;
      try {
        imageUrl = await generateThumbnail(sanitizedPrompt);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new ThumbnailGenerationError(
          `Failed to generate thumbnail: ${errorMessage}`,
          { provider: 'dall-e' }
        );
      }

      // ============================================
      // Analyze CTR Potential
      // ============================================
      let ctrScore: number | null = null;
      try {
        const analysis = await analyzeThumbnailCTR(imageUrl);
        ctrScore = analysis.score;
      } catch (err) {
        console.error("CTR analysis error:", err);
        // CTR analysis is optional, don't fail the request
      }

      // ============================================
      // Save to Database (if project_id provided)
      // ============================================
      let thumbnailId: string | null = null;
      const projectId = body.project_id;
      if (projectId) {
        const { data: thumbnail } = await supabase
          .from("thumbnails")
          .insert({
            project_id: projectId,
            image_url: imageUrl,
            prompt: sanitizedPrompt,
            ctr_score: ctrScore,
          })
          .select()
          .single();

        thumbnailId = thumbnail?.id || null;
      }

      // ============================================
      // Update Usage Counter
      // ============================================
      await supabase.rpc("increment_usage", {
        p_user_id: user.id,
        p_type: "thumbnail",
        p_count: 1,
      });

      // ============================================
      // Return Success Response
      // ============================================
      return createSuccessResponse({
        image_url: imageUrl,
        ctr_score: ctrScore,
        thumbnail_id: thumbnailId,
        text_overlay: sanitizedTextOverlay,
        usage: {
          current: currentCount + 1,
          limit: limits.thumbnails_per_month,
          remaining: limits.thumbnails_per_month === -1
            ? 'unlimited'
            : limits.thumbnails_per_month - currentCount - 1,
        },
      });
    } catch (error) {
      return handleApiError(error, {
        logError: true,
        includeStack: process.env.NODE_ENV === 'development',
      });
    }
  }, { plan: 'free' });
}
