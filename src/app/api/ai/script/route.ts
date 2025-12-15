/**
 * Script Generation API Route
 * POST /api/ai/script
 *
 * Features:
 * - Input validation with Zod
 * - Rate limiting
 * - Error handling with structured errors
 * - Usage tracking
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateScript } from "@/lib/ai/claude";
import { PLAN_LIMITS } from "@/types";

// Error handling
import { handleApiError, createSuccessResponse } from "@/lib/errors/handler";
import { ForbiddenError } from "@/lib/errors/api";
import { ValidationError } from "@/lib/errors/validation";
import { AuthenticationError } from "@/lib/errors/auth";
import { ScriptGenerationError } from "@/lib/errors/ai";

// Rate limiting
import { withRateLimit } from "@/lib/rate-limit";

// Validation
import { scriptGenerationSchema } from "@/lib/validation/schemas/script";
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
        .eq("type", "script")
        .eq("month", currentMonth)
        .single();

      const currentCount = usage?.count || 0;
      if (limits.scripts_per_month !== -1 && currentCount >= limits.scripts_per_month) {
        throw new ForbiddenError(
          `Monthly script limit of ${limits.scripts_per_month} reached. Please upgrade your plan.`
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
      const validationResult = scriptGenerationSchema.safeParse(body);
      if (!validationResult.success) {
        throw ValidationError.fromZodError(validationResult.error);
      }

      const validatedData = validationResult.data;

      // Sanitize text inputs
      const sanitizedTopic = sanitizeText(validatedData.topic);
      const sanitizedNiche = validatedData.niche ? sanitizeText(validatedData.niche) : undefined;

      // ============================================
      // Generate Script
      // ============================================
      let result;
      try {
        result = await generateScript({
          topic: sanitizedTopic,
          niche: sanitizedNiche || "general",
          tone: validatedData.tone || "casual",
          target_duration: validatedData.target_duration || 10,
          include_hook: validatedData.include_hook !== false,
          include_cta: validatedData.include_cta !== false,
          language: validatedData.language || "en",
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new ScriptGenerationError(
          `Failed to generate script: ${errorMessage}`,
          { provider: 'claude' }
        );
      }

      // ============================================
      // Update Usage Counter
      // ============================================
      await supabase.rpc("increment_usage", {
        p_user_id: user.id,
        p_type: "script",
        p_count: 1,
      });

      // ============================================
      // Return Success Response
      // ============================================
      return createSuccessResponse({
        ...result,
        usage: {
          current: currentCount + 1,
          limit: limits.scripts_per_month,
          remaining: limits.scripts_per_month === -1
            ? 'unlimited'
            : limits.scripts_per_month - currentCount - 1,
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
