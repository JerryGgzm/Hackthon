"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { springGentle, springBouncy } from "@/lib/motion";
import type { PipelineEvent } from "@/types";

interface PipelineProgressProps {
  isRunning: boolean;
  events: PipelineEvent[];
  currentChannel: string | null;
  progress: { current: number; total: number } | null;
  error: string | null;
  summary: { total_processed: number; total_saved: number; total_errors: number } | null;
  onCancel: () => void;
}

export function PipelineProgress({
  isRunning,
  events,
  currentChannel,
  progress,
  error,
  summary,
  onCancel,
}: PipelineProgressProps) {
  const searchEvent = events.find((e) => e.type === "search_complete");
  const filterEvent = events.find((e) => e.type === "filter_complete");
  const totalCandidates = (searchEvent?.data?.total_candidates as number) ?? 0;
  const qualifiedCount = (filterEvent?.data?.qualified as number) ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springGentle}
      className="space-y-4 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Pipeline Progress</h3>
        {isRunning && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3 text-sm">
        <AnimatePresence>
          {/* Search step */}
          {searchEvent ? (
            <StepRow
              key="search-done"
              done
              label={`Found ${totalCandidates} candidate channels`}
            />
          ) : isRunning ? (
            <StepRow key="search-loading" loading label="Searching YouTube..." />
          ) : null}

          {/* Filter step */}
          {filterEvent ? (
            <StepRow
              key="filter-done"
              done
              label={`${qualifiedCount} channels meet subscriber threshold`}
            />
          ) : searchEvent && isRunning ? (
            <StepRow key="filter-loading" loading label="Filtering by subscribers..." />
          ) : null}
        </AnimatePresence>

        {/* Processing step */}
        {progress && (
          <div className="space-y-2">
            <StepRow
              loading={isRunning && !summary}
              done={!!summary}
              label={
                summary
                  ? `Processed ${summary.total_processed} channels`
                  : `Processing ${currentChannel ?? "..."} (${progress.current}/${progress.total})`
              }
            />
            {/* Progress bar */}
            <div className="ml-7 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.round((progress.current / progress.total) * 100)}%`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      {summary && (
        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-mono">{summary.total_saved}</span> leads saved
            {summary.total_errors > 0 && (
              <>, <span className="font-mono">{summary.total_errors}</span> errors</>
            )}
          </p>
          {summary.total_saved > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springBouncy}
            >
              <Link href="/triage">
                <Button className="w-full">
                  Go to Triage
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function StepRow({
  loading,
  done,
  label,
}: {
  loading?: boolean;
  done?: boolean;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={springGentle}
      className="flex items-center gap-2.5"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      {done && <CheckCircle2 className="h-4 w-4 text-success" />}
      <span className="text-muted-foreground">{label}</span>
    </motion.div>
  );
}
