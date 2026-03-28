import { insforge } from "@/lib/insforge";
import { searchChannels, getChannelDetails, getLatestVideo } from "@/lib/youtube";
import { fetchTranscript, transcriptToText } from "@/lib/transcript";
import { buildAnalysisPrompt } from "@/lib/prompts";
import { analyzeCreator } from "@/lib/ai";
import type { UserContext } from "@/types";

// Force Node.js runtime (not Edge) for long-running pipeline
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contextId: string = body.context_id;

    if (!contextId) {
      return new Response(
        JSON.stringify({ error: "context_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Load context from DB
    const { data: contextRows, error: ctxError } = await insforge.database
      .from("user_context")
      .select("*")
      .eq("id", contextId);

    if (ctxError || !contextRows || (Array.isArray(contextRows) && contextRows.length === 0)) {
      return new Response(
        JSON.stringify({ error: "Context not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const context = (Array.isArray(contextRows) ? contextRows[0] : contextRows) as UserContext;

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        function sendEvent(type: string, data: Record<string, unknown>) {
          const event = `data: ${JSON.stringify({ type, data })}\n\n`;
          controller.enqueue(encoder.encode(event));
        }

        try {
          // 1. Search YouTube for channels
          const keywords = context.spider_keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);

          const allChannelIds = new Set<string>();
          for (const keyword of keywords) {
            try {
              const ids = await searchChannels(keyword, 10);
              ids.forEach((id) => allChannelIds.add(id));
            } catch (err) {
              console.error(`Search failed for keyword "${keyword}":`, err);
            }
          }

          sendEvent("search_complete", {
            total_candidates: allChannelIds.size,
          });

          if (allChannelIds.size === 0) {
            sendEvent("pipeline_complete", {
              total_processed: 0,
              total_saved: 0,
              total_errors: 0,
            });
            controller.close();
            return;
          }

          // 2. Get channel details and filter by subscribers
          const channelDetails = await getChannelDetails([...allChannelIds]);
          const qualified = channelDetails.filter(
            (ch) => ch.subscriberCount >= context.min_subscribers
          );

          sendEvent("filter_complete", { qualified: qualified.length });

          if (qualified.length === 0) {
            sendEvent("pipeline_complete", {
              total_processed: 0,
              total_saved: 0,
              total_errors: 0,
            });
            controller.close();
            return;
          }

          // 3. Process each channel
          let totalSaved = 0;
          let totalErrors = 0;

          for (let i = 0; i < qualified.length; i++) {
            const channel = qualified[i];

            sendEvent("lead_processing", {
              index: i + 1,
              total: qualified.length,
              channel_name: channel.channelName,
            });

            try {
              // 3a. Get latest video
              const latestVideo = await getLatestVideo(channel.channelId);
              if (!latestVideo) {
                sendEvent("lead_error", {
                  channel_name: channel.channelName,
                  error: "No videos found",
                });
                totalErrors++;
                continue;
              }

              // 3b. Fetch transcript
              const transcriptSegments = await fetchTranscript(latestVideo.videoId);
              const transcriptText = transcriptToText(transcriptSegments);

              // 3c. AI analysis
              const { system, user } = buildAnalysisPrompt({
                productValue: context.product_value,
                painPoints: context.target_pain_points,
                channelName: channel.channelName,
                videoTitle: latestVideo.title,
                transcriptText,
              });

              const analysis = await analyzeCreator(system, user);

              // 3d. Save to DB
              const leadData = {
                id: channel.channelId,
                context_id: contextId,
                channel_name: channel.channelName,
                channel_url: channel.channelUrl,
                subscriber_count: channel.subscriberCount,
                latest_video_title: latestVideo.title,
                latest_video_id: latestVideo.videoId,
                transcript_raw: transcriptSegments,
                match_score: analysis.match_score,
                ai_reasoning: analysis.reasoning,
                key_quotes: analysis.key_quotes,
                email_draft_template:
                  analysis.email_body
                    ? `Subject: ${analysis.email_subject}\n\n${analysis.email_body}`
                    : null,
                status: "pending",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };

              // Upsert: delete existing then insert
              await insforge.database
                .from("youtube_leads")
                .delete()
                .eq("id", channel.channelId);

              const { error: insertError } = await insforge.database
                .from("youtube_leads")
                .insert([leadData]);

              if (insertError) {
                sendEvent("lead_error", {
                  channel_name: channel.channelName,
                  error: `DB save failed: ${insertError.message}`,
                });
                totalErrors++;
                continue;
              }

              sendEvent("lead_complete", { lead: leadData });
              totalSaved++;
            } catch (err) {
              const errMsg =
                err instanceof Error ? err.message : "Unknown error";
              sendEvent("lead_error", {
                channel_name: channel.channelName,
                error: errMsg,
              });
              totalErrors++;
            }
          }

          // 4. Done
          sendEvent("pipeline_complete", {
            total_processed: qualified.length,
            total_saved: totalSaved,
            total_errors: totalErrors,
          });
        } catch (err) {
          const errMsg =
            err instanceof Error ? err.message : "Pipeline failed";
          sendEvent("lead_error", {
            channel_name: "Pipeline",
            error: errMsg,
          });
          sendEvent("pipeline_complete", {
            total_processed: 0,
            total_saved: 0,
            total_errors: 1,
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
