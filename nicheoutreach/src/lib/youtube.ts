import type { YouTubeChannelInfo, YouTubeVideoInfo } from "@/types";

const YT_API_BASE = "https://www.googleapis.com/youtube/v3";

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY environment variable is not set");
  return key;
}

export async function searchChannels(
  keyword: string,
  maxResults = 10
): Promise<string[]> {
  const params = new URLSearchParams({
    part: "snippet",
    q: keyword,
    type: "channel",
    maxResults: String(maxResults),
    key: getApiKey(),
  });

  const res = await fetch(`${YT_API_BASE}/search?${params}`);
  if (!res.ok) {
    throw new Error(`YouTube search failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const channelIds: string[] = (data.items ?? [])
    .map((item: Record<string, Record<string, string>>) => item.snippet?.channelId)
    .filter(Boolean);

  return [...new Set(channelIds)];
}

export async function getChannelDetails(
  channelIds: string[]
): Promise<YouTubeChannelInfo[]> {
  if (channelIds.length === 0) return [];

  // YouTube API allows max 50 IDs per request
  const batchSize = 50;
  const results: YouTubeChannelInfo[] = [];

  for (let i = 0; i < channelIds.length; i += batchSize) {
    const batch = channelIds.slice(i, i + batchSize);
    const params = new URLSearchParams({
      part: "snippet,statistics",
      id: batch.join(","),
      key: getApiKey(),
    });

    const res = await fetch(`${YT_API_BASE}/channels?${params}`);
    if (!res.ok) {
      throw new Error(`YouTube channels fetch failed: ${res.status}`);
    }

    const data = await res.json();
    for (const item of data.items ?? []) {
      results.push({
        channelId: item.id,
        channelName: item.snippet?.title ?? "Unknown",
        channelUrl: `https://youtube.com/channel/${item.id}`,
        subscriberCount: parseInt(item.statistics?.subscriberCount ?? "0", 10),
        description: item.snippet?.description ?? "",
      });
    }
  }

  return results;
}

export async function getLatestVideo(
  channelId: string
): Promise<YouTubeVideoInfo | null> {
  // Derive uploads playlist ID: replace "UC" prefix with "UU"
  const uploadsPlaylistId = "UU" + channelId.slice(2);

  const params = new URLSearchParams({
    part: "snippet",
    playlistId: uploadsPlaylistId,
    maxResults: "1",
    key: getApiKey(),
  });

  const res = await fetch(`${YT_API_BASE}/playlistItems?${params}`);
  if (!res.ok) return null;

  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;

  return {
    videoId: item.snippet?.resourceId?.videoId ?? "",
    title: item.snippet?.title ?? "Untitled",
    publishedAt: item.snippet?.publishedAt ?? "",
  };
}
