// ── Database Models ──

export interface UserContext {
  id: string;
  product_value: string;
  target_pain_points: string;
  spider_keywords: string;
  min_subscribers: number;
  created_at: string;
}

export type UserContextCreate = Omit<UserContext, "id" | "created_at">;

export type LeadStatus = "pending" | "approved" | "rejected";

export interface YoutubeLead {
  id: string; // YouTube Channel ID
  context_id: string;
  channel_name: string;
  channel_url: string;
  subscriber_count: number;
  latest_video_title: string;
  latest_video_id: string;
  transcript_raw: TranscriptSegment[] | null;
  match_score: number;
  ai_reasoning: string;
  key_quotes: string[] | null;
  email_draft_template: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

// ── AI Response ──

export interface AIAnalysisResult {
  match_score: number;
  reasoning: string;
  key_quotes: string[];
  email_subject: string;
  email_body: string;
}

// ── Pipeline SSE Events ──

export type PipelineEventType =
  | "search_complete"
  | "filter_complete"
  | "lead_processing"
  | "lead_complete"
  | "lead_error"
  | "pipeline_complete";

export interface PipelineEvent {
  type: PipelineEventType;
  data: Record<string, unknown>;
}

export interface SearchCompleteEvent extends PipelineEvent {
  type: "search_complete";
  data: { total_candidates: number };
}

export interface FilterCompleteEvent extends PipelineEvent {
  type: "filter_complete";
  data: { qualified: number };
}

export interface LeadProcessingEvent extends PipelineEvent {
  type: "lead_processing";
  data: { index: number; total: number; channel_name: string };
}

export interface LeadCompleteEvent extends PipelineEvent {
  type: "lead_complete";
  data: { lead: YoutubeLead };
}

export interface LeadErrorEvent extends PipelineEvent {
  type: "lead_error";
  data: { channel_name: string; error: string };
}

export interface PipelineCompleteEvent extends PipelineEvent {
  type: "pipeline_complete";
  data: { total_processed: number; total_saved: number; total_errors: number };
}

// ── YouTube API Types ──

export interface YouTubeChannelInfo {
  channelId: string;
  channelName: string;
  channelUrl: string;
  subscriberCount: number;
  description: string;
}

export interface YouTubeVideoInfo {
  videoId: string;
  title: string;
  publishedAt: string;
}
