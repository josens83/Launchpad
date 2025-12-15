/**
 * Title Generation API Route
 * POST /api/ai/title
 *
 * Features:
 * - Input validation with Zod
 * - Rate limiting
 * - Error handling with structured errors
 * - Usage tracking
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateTitle } from "@/lib/ai/claude";

// Error handling
import { handleApiError, createSuccessResponse } from "@/lib/errors/handler";
import { ValidationError } from "@/lib/errors/validation";
import { AuthenticationError } from "@/lib/errors/auth";
import { TitleGenerationError } from "@/lib/errors/ai";

// Rate limiting
import { withRateLimit } from "@/lib/rate-limit";

// Validation
import { titleGenerationSchema } from "@/lib/validation/schemas/seo";
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
      const validationResult = titleGenerationSchema.safeParse(body);
      if (!validationResult.success) {
        throw ValidationError.fromZodError(validationResult.error);
      }

      const validatedData = validationResult.data;

      // Sanitize text inputs
      const sanitizedTopic = sanitizeText(validatedData.topic);
      const sanitizedKeywords = validatedData.keywords?.map(k => sanitizeText(k)) || [];

      // ============================================
      // Generate Titles
      // ============================================
      let titles;
      try {
        titles = await generateTitle(
          sanitizedTopic,
          sanitizedKeywords,
          validatedData.language || "en"
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new TitleGenerationError(
          `Failed to generate titles: ${errorMessage}`,
          { provider: 'claude' }
        );
      }

      // ============================================
      // Update Usage Counter
      // ============================================
      await supabase.rpc("increment_usage", {
        p_user_id: user.id,
        p_type: "title",
        p_count: 1,
      });

      // ============================================
      // Return Success Response
      // ============================================
      return createSuccessResponse({
        titles,
        count: titles.length,
        style: validatedData.style,
        language: validatedData.language,
      });
    } catch (error) {
      return handleApiError(error, {
        logError: true,
        includeStack: process.env.NODE_ENV === 'development',
      });
    }
  }, { plan: 'free' });
}
