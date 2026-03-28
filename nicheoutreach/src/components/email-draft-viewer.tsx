"use client";

import { useMemo } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import type { YoutubeLead } from "@/types";

interface EmailDraftViewerProps {
  lead: YoutubeLead | null;
}

export function EmailDraftViewer({ lead }: EmailDraftViewerProps) {
  const { copy } = useClipboard();

  const { renderedHtml, rawText } = useMemo(() => {
    if (!lead?.email_draft_template) {
      return { renderedHtml: "", rawText: "" };
    }

    const raw = lead.email_draft_template;

    // Replace {{variable}} with highlighted spans
    const html = raw.replace(
      /\{\{(\w+)\}\}/g,
      '<span class="bg-yellow-100 text-yellow-900 px-1 rounded font-medium">{{$1}}</span>'
    );

    // Also replace newlines with <br> for display
    const withBreaks = html.replace(/\n/g, "<br>");

    return { renderedHtml: withBreaks, rawText: raw };
  }, [lead?.email_draft_template]);

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold text-foreground">
          Email Draft for {lead.channel_name}
        </h2>
      </div>

      {/* Draft content */}
      <div className="flex-1 overflow-y-auto p-5">
        <div
          className="prose prose-sm max-w-none text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t border-border space-y-2 shrink-0">
        <Button
          size="lg"
          className="w-full"
          onClick={() => copy(rawText)}
        >
          <Copy className="h-4 w-4" />
          Copy to Clipboard
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(lead.channel_url + "/about", "_blank")}
        >
          <ExternalLink className="h-4 w-4" />
          Open Channel About Page
        </Button>
      </div>
    </div>
  );
}
