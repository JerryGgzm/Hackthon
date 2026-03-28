"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSaveContext } from "@/hooks/use-context";

const STORAGE_KEY = "nicheoutreach-context-form";

interface ContextFormProps {
  onContextSaved: (contextId: string) => void;
  disabled?: boolean;
}

function loadSavedForm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveFormToStorage(form: HTMLFormElement) {
  try {
    const data = Object.fromEntries(new FormData(form));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage might be full or unavailable
  }
}

export function ContextForm({ onContextSaved, disabled }: ContextFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const saveContext = useSaveContext();

  // Restore saved values on mount (survives remounts and page reloads)
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const saved = loadSavedForm();
    for (const [name, value] of Object.entries(saved)) {
      const el = form.elements.namedItem(name);
      if (el && el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        (el as HTMLInputElement | HTMLTextAreaElement).value = String(value);
      }
    }
  }, []);

  // Persist to sessionStorage on every input change
  const handleInput = useCallback(() => {
    if (formRef.current) {
      saveFormToStorage(formRef.current);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const product_value = (formData.get("product_value") as string ?? "").trim();
    const target_pain_points = (formData.get("target_pain_points") as string ?? "").trim();
    const spider_keywords = (formData.get("spider_keywords") as string ?? "").trim();
    const min_subscribers = parseInt(formData.get("min_subscribers") as string) || 1000;

    if (!product_value || !target_pain_points || !spider_keywords) {
      return;
    }

    saveContext.mutate(
      { product_value, target_pain_points, spider_keywords, min_subscribers },
      {
        onSuccess: (result) => {
          const data = result.data;
          const created = Array.isArray(data) ? data[0] : data;
          if (created?.id) {
            sessionStorage.removeItem(STORAGE_KEY);
            onContextSaved(created.id);
          }
        },
      }
    );
  };

  const isDisabled = disabled || saveContext.isPending;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onInput={handleInput}
      className="space-y-5"
    >
      <Textarea
        id="product_value"
        name="product_value"
        label="Product Value Proposition"
        placeholder="Describe what your product does and the value it provides..."
        rows={3}
        disabled={isDisabled}
        required
      />

      <Textarea
        id="pain_points"
        name="target_pain_points"
        label="Target Pain Points"
        placeholder="What pain points should the creators be experiencing or discussing?"
        rows={3}
        disabled={isDisabled}
        required
      />

      <Input
        id="keywords"
        name="spider_keywords"
        label="Search Keywords (comma-separated)"
        placeholder="e.g. productivity tools, SaaS review, developer workflow"
        disabled={isDisabled}
        required
      />

      <Input
        id="min_subs"
        name="min_subscribers"
        label="Minimum Subscribers"
        type="number"
        min={0}
        defaultValue={1000}
        disabled={isDisabled}
      />

      <motion.div whileTap={{ scale: 0.97 }}>
        <Button type="submit" size="lg" className="w-full" disabled={isDisabled}>
          {saveContext.isPending ? "Saving..." : "Start Crawling"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {saveContext.isError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm text-destructive"
          >
            Error: {saveContext.error?.message}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
