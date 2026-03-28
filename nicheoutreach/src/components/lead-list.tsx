"use client";

import { useRef, useEffect, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, scoreToBadgeVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { springSnappy } from "@/lib/motion";
import { useTriageStore } from "@/stores/triage-store";
import type { YoutubeLead } from "@/types";

interface LeadListProps {
  leads: YoutubeLead[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  isLoading?: boolean;
}

const ROW_HEIGHT = 80;

export function LeadList({ leads, selectedIndex, onSelect, isLoading }: LeadListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const registerCardRef = useTriageStore((s) => s.registerCardRef);

  const virtualizer = useVirtualizer({
    count: leads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  // Scroll selected item into view
  useEffect(() => {
    if (leads.length > 0 && selectedIndex >= 0 && selectedIndex < leads.length) {
      virtualizer.scrollToIndex(selectedIndex, { align: "auto" });
    }
  }, [selectedIndex, leads.length, virtualizer]);

  const handleCardRef = useCallback(
    (id: string, el: HTMLElement | null) => {
      registerCardRef(id, el);
    },
    [registerCardRef]
  );

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
        No pending leads. Run the pipeline to discover creators.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold text-foreground">
          Pending Leads
          <span className="ml-1.5 font-mono text-muted-foreground">({leads.length})</span>
        </h2>
      </div>
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          <AnimatePresence mode="popLayout">
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const lead = leads[virtualRow.index];
              const isSelected = virtualRow.index === selectedIndex;

              return (
                <div
                  key={lead.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <motion.div
                    layout
                    initial={false}
                    animate={{
                      scale: isSelected ? 1.02 : 1,
                      boxShadow: isSelected
                        ? "inset 3px 0 0 0 #FF7F00, 0 0 12px rgba(255,127,0,0.08)"
                        : "inset 3px 0 0 0 transparent, 0 0 0px transparent",
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.92,
                      x: -40,
                      transition: { ...springSnappy, duration: 0.25 },
                    }}
                    transition={springSnappy}
                    className="h-full"
                  >
                    <button
                      ref={(el) => handleCardRef(lead.id, el)}
                      type="button"
                      onClick={() => onSelect(virtualRow.index)}
                      className={cn(
                        "w-full h-full text-left px-4 py-3 border-b border-border transition-colors rounded-r-lg",
                        isSelected
                          ? "bg-primary/5"
                          : "hover:bg-accent"
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
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {lead.latest_video_title}
                      </p>
                    </button>
                  </motion.div>
                </div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
