import type { AIAnalysisResult } from "@/types";

export async function analyzeCreator(
  systemPrompt: string,
  userPrompt: string
): Promise<AIAnalysisResult> {
  const baseUrl = process.env.INSFORGE_URL;
  if (!baseUrl) throw new Error("INSFORGE_URL is not set");

  const anonKey = process.env.INSFORGE_ANON_KEY;
  if (!anonKey) throw new Error("INSFORGE_ANON_KEY is not set");

  const res = await fetch(`${baseUrl}/api/ai/chat/completion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`InsForge AI call failed (${res.status}): ${errText}`);
  }

  const responseData = await res.json();
  const rawText: string = responseData.text ?? responseData.choices?.[0]?.message?.content ?? "";

  return parseAIResponse(rawText);
}

function parseAIResponse(raw: string): AIAnalysisResult {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  try {
    const parsed = JSON.parse(cleaned);
    return {
      match_score: clampScore(parsed.match_score ?? 0),
      reasoning: String(parsed.reasoning ?? "No reasoning provided"),
      key_quotes: Array.isArray(parsed.key_quotes)
        ? parsed.key_quotes.map(String)
        : [],
      email_subject: String(parsed.email_subject ?? ""),
      email_body: String(parsed.email_body ?? ""),
    };
  } catch {
    // Fallback: try to extract JSON from the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          match_score: clampScore(parsed.match_score ?? 0),
          reasoning: String(parsed.reasoning ?? "No reasoning provided"),
          key_quotes: Array.isArray(parsed.key_quotes)
            ? parsed.key_quotes.map(String)
            : [],
          email_subject: String(parsed.email_subject ?? ""),
          email_body: String(parsed.email_body ?? ""),
        };
      } catch {
        // Total failure
      }
    }

    return {
      match_score: 0,
      reasoning: "Failed to parse AI response",
      key_quotes: [],
      email_subject: "",
      email_body: "",
    };
  }
}

function clampScore(score: unknown): number {
  const n = Number(score);
  if (isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
