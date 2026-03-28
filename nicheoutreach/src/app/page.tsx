"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ContextForm } from "@/components/context-form";
import { PipelineProgress } from "@/components/pipeline-progress";
import { usePipeline } from "@/hooks/use-pipeline";

export default function HomePage() {
  const [contextId, setContextId] = useState<string | null>(null);
  const pipeline = usePipeline();

  const handleContextSaved = (id: string) => {
    setContextId(id);
    pipeline.startPipeline(id);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">NicheOutreach</h1>
          <p className="text-muted-foreground mt-1">
            Find and reach YouTube creators who match your product
          </p>
        </div>

        <div className="space-y-6">
          <ContextForm
            onContextSaved={handleContextSaved}
            disabled={pipeline.isRunning}
          />

          {(contextId || pipeline.isRunning || pipeline.summary) && (
            <PipelineProgress
              isRunning={pipeline.isRunning}
              events={pipeline.events}
              currentChannel={pipeline.currentChannel}
              progress={pipeline.progress}
              error={pipeline.error}
              summary={pipeline.summary}
              onCancel={pipeline.cancelPipeline}
            />
          )}
        </div>
      </div>
    </div>
  );
}
