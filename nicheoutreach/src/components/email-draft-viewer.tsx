"use client";

import { useMemo, useState, useCallback, type ReactNode } from "react";
import { Copy, ExternalLink, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import { springGentle } from "@/lib/motion";
import type { YoutubeLead } from "@/types";

interface EmailDraftViewerProps {
  lead: YoutubeLead | null;
}

// Resolve a variable name to its value from the lead
function resolveVariable(name: string, lead: YoutubeLead): string {
  const map: Record<string, string> = {
    channel_name: lead.channel_name,
    subscriber_count: lead.subscriber_count.toLocaleString(),
    latest_video_title: lead.latest_video_title,
    channel_url: lead.channel_url,
    match_score: String(lead.match_score),
  };
  return map[name] ?? `{{${name}}}`;
}

// Parse template string into text segments and variable tokens
function parseTemplate(template: string): Array<{ type: "text"; value: string } | { type: "variable"; name: string }> {
  const parts: Array<{ type: "text"; value: string } | { type: "variable"; name: string }> = [];
  const regex = /\{\{(\w+)\}\}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: template.slice(lastIndex, match.index) });
    }
    parts.push({ type: "variable", name: match[1] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < template.length) {
    parts.push({ type: "text", value: template.slice(lastIndex) });
  }

  return parts;
}

function VariablePill({ name, resolvedValue }: { name: string; resolvedValue: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono text-xs font-medium animate-breathe cursor-default">
        {`{{${name}}}`}
      </span>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="glass-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs text-foreground whitespace-nowrap z-50"
          >
            <span className="text-muted-foreground">Resolves to: </span>
            <span className="font-medium">{resolvedValue}</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 glass-tooltip -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

function RenderedTemplate({ template, lead }: { template: string; lead: YoutubeLead }) {
  const parts = useMemo(() => parseTemplate(template), [template]);

  const rendered = useMemo(() => {
    const elements: ReactNode[] = [];
    parts.forEach((part, i) => {
      if (part.type === "text") {
        // Split by newlines and insert <br> elements
        const lines = part.value.split("\n");
        lines.forEach((line, j) => {
          if (j > 0) elements.push(<br key={`br-${i}-${j}`} />);
          if (line) elements.push(<span key={`text-${i}-${j}`}>{line}</span>);
        });
      } else {
        elements.push(
          <VariablePill
            key={`var-${i}`}
            name={part.name}
            resolvedValue={resolveVariable(part.name, lead)}
          />
        );
      }
    });
    return elements;
  }, [parts, lead]);

  return (
    <div className="text-sm leading-relaxed text-foreground">
      {rendered}
    </div>
  );
}

export function EmailDraftViewer({ lead }: EmailDraftViewerProps) {
  const { copy } = useClipboard();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!lead) return;
    const template = lead.email_draft_template;
    if (!template) return;
    copy(template);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [lead, copy]);

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Select an approved lead to view the email draft
      </div>
    );
  }

  if (!lead.email_draft_template) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
        No email draft available for this lead.
        <br />
        The AI may not have generated one due to insufficient data.
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={lead.id}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={springGentle}
        style={{ transformOrigin: "top left" }}
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="px-5 py-3 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold text-foreground">
            Email Draft for {lead.channel_name}
          </h2>
        </div>

        {/* Draft content */}
        <div className="flex-1 overflow-y-auto p-5">
          <RenderedTemplate template={lead.email_draft_template} lead={lead} />
        </div>

        {/* Action buttons */}
        <div className="p-4 border-t border-border space-y-2 shrink-0">
          <motion.button
            whileTap={{ scale: 0.97, y: 1 }}
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 rounded-lg font-medium w-full h-12 px-6 text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isCopied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Copied!
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(lead.channel_url + "/about", "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            Open Channel About Page
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
