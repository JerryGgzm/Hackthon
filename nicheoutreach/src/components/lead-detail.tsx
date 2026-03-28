"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Badge, scoreToBadgeVariant } from "@/components/ui/badge";
import { ExternalLink, Users, Video, Quote } from "lucide-react";
import { springGentle, staggerContainer, staggerChild, fadeSlideRight } from "@/lib/motion";
import type { YoutubeLead } from "@/types";

interface LeadDetailProps {
  lead: YoutubeLead | null;
}

export function LeadDetail({ lead }: LeadDetailProps) {
  if (!lead) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Select a lead to view details
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={lead.id}
        variants={fadeSlideRight}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={springGentle}
        className="flex flex-col h-full overflow-y-auto p-5"
      >
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-5"
        >
          {/* Header */}
          <motion.div variants={staggerChild} transition={springGentle}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {lead.channel_name}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-mono">
                      {lead.subscriber_count.toLocaleString()}
                    </span>{" "}
                    subscribers
                  </span>
                  <a
                    href={lead.channel_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Channel
                  </a>
                </div>
              </div>
            </div>

            {/* Latest video */}
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Video className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{lead.latest_video_title}</span>
            </div>
          </motion.div>

          {/* Match Score */}
          <motion.div variants={staggerChild} transition={springGentle}>
            <div className="glass-panel rounded-xl text-center py-5 px-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Match Score
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-foreground font-mono">
                  {lead.match_score}
                </span>
                <span className="text-lg text-muted-foreground font-mono">/ 100</span>
              </div>
              <Badge variant={scoreToBadgeVariant(lead.match_score)} className="mt-2">
                {lead.match_score >= 80
                  ? "Strong Match"
                  : lead.match_score >= 60
                    ? "Moderate Match"
                    : "Weak Match"}
              </Badge>
            </div>
          </motion.div>

          {/* AI Reasoning */}
          <motion.div variants={staggerChild} transition={springGentle}>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              AI Reasoning
            </h3>
            <div className="bg-card rounded-xl p-4 text-sm leading-relaxed text-foreground border-l-4 border-primary">
              {lead.ai_reasoning}
            </div>
          </motion.div>

          {/* Key Quotes */}
          {lead.key_quotes && lead.key_quotes.length > 0 && (
            <motion.div variants={staggerChild} transition={springGentle}>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Quote className="h-4 w-4" />
                Key Quotes from Transcript
              </h3>
              <div className="space-y-2">
                {lead.key_quotes.map((quote, i) => (
                  <blockquote
                    key={i}
                    className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl px-4 py-3 text-sm text-amber-900 italic"
                  >
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
