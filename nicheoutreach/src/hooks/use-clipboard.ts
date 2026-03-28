"use client";

import { useCallback } from "react";
import { toast } from "sonner";

export function useClipboard() {
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch {
      // Fallback for older browsers
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toast.success("Copied to clipboard!");
      } catch {
        toast.error("Failed to copy to clipboard");
      }
    }
  }, []);

  return { copy };
}
