"use client";

import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useUpdateLeadStatus } from "@/hooks/use-leads";
import { useAnimationStore } from "@/stores/animation-store";
import { useTriageStore } from "@/stores/triage-store";
import type { YoutubeLead } from "@/types";

interface TriageKeyboardOptions {
  leads: YoutubeLead[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  enabled?: boolean;
}

export function useTriageKeyboard({
  leads,
  selectedIndex,
  setSelectedIndex,
  enabled = true,
}: TriageKeyboardOptions) {
  const updateStatus = useUpdateLeadStatus();

  const navigateUp = useCallback(() => {
    setSelectedIndex(Math.max(0, selectedIndex - 1));
  }, [selectedIndex, setSelectedIndex]);

  const navigateDown = useCallback(() => {
    setSelectedIndex(Math.min(leads.length - 1, selectedIndex + 1));
  }, [selectedIndex, leads.length, setSelectedIndex]);

  const approve = useCallback(() => {
    const lead = leads[selectedIndex];
    if (!lead) return;

    // Capture card position for fly animation
    const cardEl = useTriageStore.getState().cardRefs.get(lead.id);
    const sourceRect = cardEl?.getBoundingClientRect();

    if (sourceRect) {
      // Enqueue fly animation
      useAnimationStore.getState().enqueueFly({
        id: lead.id,
        channelName: lead.channel_name,
        sourceRect,
        score: lead.match_score,
      });
    }

    // Mark as animating out
    useTriageStore.getState().addAnimatingOut(lead.id);

    // Delayed mutation so fly phantom can mount first
    setTimeout(() => {
      updateStatus.mutate({ id: lead.id, status: "approved" });
    }, 80);

    // Keep index the same (next item slides up), clamp if at end
    if (selectedIndex >= leads.length - 1) {
      setSelectedIndex(Math.max(0, leads.length - 2));
    }
  }, [leads, selectedIndex, updateStatus, setSelectedIndex]);

  const reject = useCallback(() => {
    const lead = leads[selectedIndex];
    if (!lead) return;

    // Mark as animating out (fade-left exit)
    useTriageStore.getState().addAnimatingOut(lead.id);

    // Fire mutation immediately for reject
    updateStatus.mutate({ id: lead.id, status: "rejected" });

    if (selectedIndex >= leads.length - 1) {
      setSelectedIndex(Math.max(0, leads.length - 2));
    }
  }, [leads, selectedIndex, updateStatus, setSelectedIndex]);

  const isActive = enabled && leads.length > 0;

  useHotkeys("up", navigateUp, { enabled: isActive, preventDefault: true }, [navigateUp]);
  useHotkeys("down", navigateDown, { enabled: isActive, preventDefault: true }, [navigateDown]);
  useHotkeys("enter", approve, { enabled: isActive, preventDefault: true }, [approve]);
  useHotkeys("right", approve, { enabled: isActive, preventDefault: true }, [approve]);
  useHotkeys("backspace", reject, { enabled: isActive, preventDefault: true }, [reject]);
  useHotkeys("left", reject, { enabled: isActive, preventDefault: true }, [reject]);

  return { approve, reject, navigateUp, navigateDown };
}
