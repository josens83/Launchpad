import Anthropic from "@anthropic-ai/sdk";
import type { ScriptGenerationRequest, ScriptGenerationResponse, ScriptSection } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateScript(
  request: ScriptGenerationRequest
): Promise<ScriptGenerationResponse> {
  const systemPrompt = `You are an expert YouTube scriptwriter who creates engaging, viewer-retaining scripts.
Your scripts are optimized for the YouTube algorithm and viewer engagement.
Always structure scripts with clear sections: Hook, Intro, Main Content, and Outro with CTA.
Write in a conversational, ${request.tone} tone that connects with the audience.
Target duration: ${request.target_duration} minutes (approximately ${request.target_duration * 150} words).
Language: ${request.language}`;

  const userPrompt = `Create a YouTube script about: ${request.topic}
Niche: ${request.niche}
${request.include_hook ? "Include a compelling hook in the first 10 seconds." : ""}
${request.include_cta ? "Include a call-to-action for likes, subscribes, and comments." : ""}

Format your response as JSON with the following structure:
{
  "sections": [
    {"type": "hook", "content": "...", "duration": 10},
    {"type": "intro", "content": "...", "duration": 20},
    {"type": "main", "content": "...", "duration": ${(request.target_duration - 1) * 60}},
    {"type": "outro", "content": "...", "duration": 20},
    {"type": "cta", "content": "...", "duration": 10}
  ]
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  // Parse the JSON response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse script response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const sections: ScriptSection[] = parsed.sections;

  // Combine all sections into full script
  const fullScript = sections.map((s) => s.content).join("\n\n");
  const wordCount = fullScript.split(/\s+/).length;
  const estimatedDuration = sections.reduce((acc, s) => acc + (s.duration || 0), 0);

  return {
    script: fullScript,
    sections,
    word_count: wordCount,
    estimated_duration: estimatedDuration,
  };
}

export async function generateTitle(
  topic: string,
  keywords: string[],
  language: string = "en"
): Promise<string[]> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Generate 5 compelling YouTube video titles for a video about: ${topic}
Keywords to include: ${keywords.join(", ")}
Language: ${language}

Requirements:
- Each title should be under 60 characters
- Use power words that drive clicks
- Create curiosity or promise value
- Avoid clickbait that doesn't deliver

Return only the titles, one per line, numbered 1-5.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  const titles = content.text
    .split("\n")
    .filter((line) => line.match(/^\d+\./))
    .map((line) => line.replace(/^\d+\.\s*/, "").trim());

  return titles;
}

export async function generateDescription(
  title: string,
  scriptSummary: string,
  keywords: string[],
  includeTimestamps: boolean,
  language: string = "en"
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Create a YouTube video description for:
Title: ${title}
Script Summary: ${scriptSummary}
Keywords: ${keywords.join(", ")}
Language: ${language}
${includeTimestamps ? "Include example timestamps section." : ""}

Requirements:
- First 2-3 sentences should hook viewers and include main keyword
- Include relevant hashtags (3-5)
- Add a call-to-action for subscribing
- Be 200-500 words
- Make it SEO-friendly while remaining natural`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  return content.text;
}

export async function generateTags(
  topic: string,
  keywords: string[],
  niche: string
): Promise<string[]> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Generate 15-20 YouTube tags for a video about: ${topic}
Keywords: ${keywords.join(", ")}
Niche: ${niche}

Requirements:
- Mix of broad and specific tags
- Include variations and related terms
- Keep each tag under 30 characters
- Return as comma-separated list`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  return content.text.split(",").map((tag) => tag.trim());
}

export async function analyzeCompetitor(
  channelData: { name: string; videos: string[] }
): Promise<{
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  content_gaps: string[];
}> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Analyze this YouTube channel's content strategy:
Channel: ${channelData.name}
Recent Video Titles: ${channelData.videos.join(", ")}

Provide analysis as JSON:
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "opportunities": ["..."],
  "content_gaps": ["..."]
}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse analysis response");
  }

  return JSON.parse(jsonMatch[0]);
}

export async function suggestContentIdeas(
  niche: string,
  existingTopics: string[],
  trendingTopics: string[]
): Promise<{ idea: string; reason: string; difficulty: string }[]> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Suggest 10 content ideas for a YouTube channel in the ${niche} niche.

Already covered topics: ${existingTopics.join(", ")}
Current trending topics: ${trendingTopics.join(", ")}

Return as JSON array:
[
  {"idea": "...", "reason": "why this would perform well", "difficulty": "easy/medium/hard"}
]`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  const jsonMatch = content.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse ideas response");
  }

  return JSON.parse(jsonMatch[0]);
}
