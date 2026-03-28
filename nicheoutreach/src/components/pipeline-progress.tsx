"use client";

import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
    <div className="space-y-4 rounded-lg border border-border bg-accent/50 p-5">
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
        {/* Search step */}
        {searchEvent ? (
          <StepRow
            done
            label={`Found ${totalCandidates} candidate channels`}
          />
        ) : isRunning ? (
          <StepRow loading label="Searching YouTube..." />
        ) : null}

        {/* Filter step */}
        {filterEvent ? (
          <StepRow
            done
            label={`${qualifiedCount} channels meet subscriber threshold`}
          />
        ) : searchEvent && isRunning ? (
          <StepRow loading label="Filtering by subscribers..." />
        ) : null}

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
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{
                  width: `${Math.round((progress.current / progress.total) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {summary.total_saved} leads saved
            {summary.total_errors > 0 && `, ${summary.total_errors} errors`}
          </p>
          {summary.total_saved > 0 && (
            <Link href="/triage">
              <Button className="w-full">
                Go to Triage
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
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
    <div className="flex items-center gap-2.5">
      {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      {done && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
