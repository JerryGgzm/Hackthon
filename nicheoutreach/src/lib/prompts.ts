interface PromptParams {
  productValue: string;
  painPoints: string;
  channelName: string;
  videoTitle: string;
  transcriptText: string;
}

export function buildAnalysisPrompt(params: PromptParams): {
  system: string;
  user: string;
} {
  const system = `You are an expert growth hacker specializing in cold outreach to YouTube creators.

Your task is to analyze a YouTube creator's content and determine how well they match a product, then generate a highly personalized email draft.

CRITICAL RULES:
- Find specific pain points or statements from the creator's video transcript
- Generate a hook that references something SPECIFIC they said - never generic flattery like "I watched your video"
- Use {{variable}} placeholders in the email for parts the human should review/customize
- Output ONLY valid JSON with no markdown wrapping, no code fences, no extra text
- The match_score should reflect genuine relevance (0-100), not inflated numbers

OUTPUT FORMAT (strict JSON):
{
  "match_score": <number 0-100>,
  "reasoning": "<2-3 sentences explaining why this creator matches or doesn't>",
  "key_quotes": ["<exact quote from transcript>", "<another quote>"],
  "email_subject": "<subject line>",
  "email_body": "<full email body with {{channel_name}}, {{video_title}}, {{hook_quote}} variables>"
}`;

  const hasTranscript = params.transcriptText.length > 0;

  const user = `PRODUCT VALUE PROPOSITION:
${params.productValue}

TARGET PAIN POINTS TO MATCH:
${params.painPoints}

YOUTUBE CREATOR INFO:
- Channel: ${params.channelName}
- Latest Video Title: "${params.videoTitle}"
${hasTranscript ? `\nVIDEO TRANSCRIPT (excerpt):\n${params.transcriptText}` : "\n(No transcript available - analyze based on video title and channel info only)"}

Analyze this creator and generate the personalized email. Remember to output ONLY valid JSON.`;

  return { system, user };
}
