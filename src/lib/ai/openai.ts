import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateThumbnail(prompt: string): Promise<string> {
  const enhancedPrompt = `Create a YouTube thumbnail: ${prompt}.
Style: High contrast, bold colors, professional YouTube thumbnail aesthetic.
Composition: Clean, uncluttered, with clear focal point.
Text area: Leave space for text overlay if needed.`;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: enhancedPrompt,
    n: 1,
    size: "1792x1024", // Closest to 16:9 for YouTube thumbnails
    quality: "hd",
  });

  if (!response.data[0]?.url) {
    throw new Error("Failed to generate thumbnail");
  }

  return response.data[0].url;
}

export async function transcribeAudio(audioFile: File): Promise<{
  text: string;
  segments: { start: number; end: number; text: string }[];
}> {
  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  return {
    text: response.text,
    segments: (response.segments || []).map((seg) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text,
    })),
  };
}

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the following text to ${targetLanguage}. Maintain the original tone and style.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return response.choices[0]?.message?.content || text;
}

export async function analyzeThumbnailCTR(imageUrl: string): Promise<{
  score: number;
  suggestions: string[];
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this YouTube thumbnail and predict its click-through rate potential on a scale of 1-100.

Evaluate based on:
1. Color contrast and visibility
2. Emotional impact
3. Text readability (if any)
4. Professional quality
5. Curiosity factor

Return as JSON:
{
  "score": number,
  "suggestions": ["improvement suggestion 1", "improvement suggestion 2", ...]
}`,
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to analyze thumbnail");
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse analysis response");
  }

  return JSON.parse(jsonMatch[0]);
}
