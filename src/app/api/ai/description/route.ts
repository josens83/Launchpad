/**
 * Description Generation API Route
 * POST /api/ai/description
 *
 * Features:
 * - Input validation with Zod
 * - Rate limiting
 * - Error handling with structured errors
 * - Usage tracking
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDescription } from "@/lib/ai/claude";

// Error handling
import { handleApiError, createSuccessResponse } from "@/lib/errors/handler";
import { ValidationError } from "@/lib/errors/validation";
import { AuthenticationError } from "@/lib/errors/auth";
import { DescriptionGenerationError } from "@/lib/errors/ai";

// Rate limiting
import { withRateLimit } from "@/lib/rate-limit";

// Validation
import { descriptionGenerationSchema } from "@/lib/validation/schemas/seo";
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
      // Parse and Validate Request Body
      // ============================================
      let body;
      try {
        body = await request.json();
      } catch {
        throw new ValidationError('Invalid JSON body');
      }

      // Validate with Zod schema
      const validationResult = descriptionGenerationSchema.safeParse(body);
      if (!validationResult.success) {
        throw ValidationError.fromZodError(validationResult.error);
      }

      const validatedData = validationResult.data;

      // Sanitize text inputs
      const sanitizedTitle = sanitizeText(validatedData.title);
      const sanitizedTopic = validatedData.topic ? sanitizeText(validatedData.topic) : "";
      const sanitizedKeywords = validatedData.keywords?.map(k => sanitizeText(k)) || [];

      // ============================================
      // Generate Description
      // ============================================
      let description;
      try {
        description = await generateDescription(
          sanitizedTitle,
          sanitizedTopic,
          sanitizedKeywords,
          validatedData.include_timestamps,
          validatedData.language || "en"
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new DescriptionGenerationError(
          `Failed to generate description: ${errorMessage}`,
          { provider: 'claude' }
        );
      }

      // ============================================
      // Update Usage Counter
      // ============================================
      await supabase.rpc("increment_usage", {
        p_user_id: user.id,
        p_type: "description",
        p_count: 1,
      });

      // ============================================
      // Return Success Response
      // ============================================
      return createSuccessResponse({
        description,
        style: validatedData.style,
        language: validatedData.language,
        include_timestamps: validatedData.include_timestamps,
        include_links: validatedData.include_links,
        include_hashtags: validatedData.include_hashtags,
      });
    } catch (error) {
      return handleApiError(error, {
        logError: true,
        includeStack: process.env.NODE_ENV === 'development',
      });
    }
  }, { plan: 'free' });
}
