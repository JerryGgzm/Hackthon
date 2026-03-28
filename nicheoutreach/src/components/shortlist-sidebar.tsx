"use client";

import { motion } from "framer-motion";
import { Badge, scoreToBadgeVariant } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { springGentle, staggerContainer, staggerChild } from "@/lib/motion";
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
          Approved
          <span className="ml-1.5 font-mono text-muted-foreground">({leads.length})</span>
        </h2>
      </div>
      <motion.div
        className="flex-1 overflow-y-auto"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {leads.map((lead) => (
          <motion.button
            key={lead.id}
            variants={staggerChild}
            transition={springGentle}
            type="button"
            onClick={() => onSelect(lead.id)}
            className={cn(
              "w-full text-left px-4 py-3 border-b border-border transition-colors",
              selectedId === lead.id
                ? "bg-primary/5"
                : "hover:bg-accent"
            )}
            style={{
              boxShadow:
                selectedId === lead.id
                  ? "inset 3px 0 0 0 #FF7F00, 0 0 12px rgba(255,127,0,0.08)"
                  : "inset 3px 0 0 0 transparent",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm text-foreground truncate">
                {lead.channel_name}
              </span>
              <Badge variant={scoreToBadgeVariant(lead.match_score)}>
                {lead.match_score}
              </Badge>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
