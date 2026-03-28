"use client";

import { Badge, scoreToBadgeVariant } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { YoutubeLead } from "@/types";

interface ShortlistSidebarProps {
  leads: YoutubeLead[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function ShortlistSidebar({
  leads,
  selectedId,
  onSelect,
  isLoading,
}: ShortlistSidebarProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
        No approved leads yet. Use the Triage page to approve creators.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold text-foreground">
          Approved ({leads.length})
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {leads.map((lead) => (
          <button
            key={lead.id}
            type="button"
            onClick={() => onSelect(lead.id)}
            className={cn(
              "w-full text-left px-4 py-3 border-b border-border transition-colors",
              selectedId === lead.id
                ? "bg-primary/5 border-l-2 border-l-primary"
                : "hover:bg-accent border-l-2 border-l-transparent"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm text-foreground truncate">
                {lead.channel_name}
              </span>
              <Badge variant={scoreToBadgeVariant(lead.match_score)}>
                {lead.match_score}
              </Badge>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
