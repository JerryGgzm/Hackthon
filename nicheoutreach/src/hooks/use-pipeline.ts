"use client";

import { useState, useCallback, useRef } from "react";
import type { PipelineEvent } from "@/types";

interface PipelineState {
  isRunning: boolean;
  events: PipelineEvent[];
  currentChannel: string | null;
  progress: { current: number; total: number } | null;
  error: string | null;
  summary: { total_processed: number; total_saved: number; total_errors: number } | null;
}

export function usePipeline() {
  const [state, setState] = useState<PipelineState>({
    isRunning: false,
    events: [],
    currentChannel: null,
    progress: null,
    error: null,
    summary: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const startPipeline = useCallback(async (contextId: string) => {
    // Reset state
    setState({
      isRunning: true,
      events: [],
      currentChannel: null,
      progress: null,
      error: null,
      summary: null,
    });

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/pipeline/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context_id: contextId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errData = await res.json();
        setState((prev) => ({
          ...prev,
          isRunning: false,
          error: errData.error ?? `Pipeline failed with status ${res.status}`,
        }));
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setState((prev) => ({
          ...prev,
          isRunning: false,
          error: "No response stream",
        }));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6)) as PipelineEvent;

              setState((prev) => {
                const newState = {
                  ...prev,
                  events: [...prev.events, event],
                };

                switch (event.type) {
                  case "search_complete":
                    break;
                  case "filter_complete":
                    break;
                  case "lead_processing":
                    newState.currentChannel = event.data.channel_name as string;
                    newState.progress = {
                      current: event.data.index as number,
                      total: event.data.total as number,
                    };
                    break;
                  case "lead_complete":
                    break;
                  case "lead_error":
                    break;
                  case "pipeline_complete":
                    newState.isRunning = false;
                    newState.currentChannel = null;
                    newState.summary = event.data as PipelineState["summary"];
                    break;
                }

                return newState;
              });
            } catch {
              // Ignore malformed events
            }
          }
        }
      }

      // Ensure we mark as done
      setState((prev) => ({ ...prev, isRunning: false }));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setState((prev) => ({
          ...prev,
          isRunning: false,
          error: "Pipeline cancelled",
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isRunning: false,
          error: err instanceof Error ? err.message : "Pipeline failed",
        }));
      }
    }
  }, []);

  const cancelPipeline = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { ...state, startPipeline, cancelPipeline };
}
