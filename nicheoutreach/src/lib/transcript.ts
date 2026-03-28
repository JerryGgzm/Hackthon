import { YoutubeTranscript } from "youtube-transcript";
import type { TranscriptSegment } from "@/types";

export async function fetchTranscript(
  videoId: string
): Promise<TranscriptSegment[] | null> {
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    return segments.map((s) => ({
      text: s.text,
      offset: s.offset,
      duration: s.duration,
    }));
  } catch {
    // Many videos don't have captions - this is expected
    return null;
  }
}

export function transcriptToText(
  segments: TranscriptSegment[] | null,
  maxChars = 8000
): string {
  if (!segments || segments.length === 0) return "";
  const fullText = segments.map((s) => s.text).join(" ");
  if (fullText.length <= maxChars) return fullText;
  return fullText.slice(0, maxChars) + "...";
}
