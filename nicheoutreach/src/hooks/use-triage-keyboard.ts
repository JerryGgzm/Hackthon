"use client";

import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useUpdateLeadStatus } from "@/hooks/use-leads";
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
    updateStatus.mutate({ id: lead.id, status: "approved" });
    // Keep index the same (next item slides up), clamp if at end
    if (selectedIndex >= leads.length - 1) {
      setSelectedIndex(Math.max(0, leads.length - 2));
    }
  }, [leads, selectedIndex, updateStatus, setSelectedIndex]);

  const reject = useCallback(() => {
    const lead = leads[selectedIndex];
    if (!lead) return;
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
