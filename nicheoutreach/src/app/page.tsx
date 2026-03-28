"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ContextForm } from "@/components/context-form";
import { PipelineProgress } from "@/components/pipeline-progress";
import { usePipeline } from "@/hooks/use-pipeline";
import { springGentle, fadeUp } from "@/lib/motion";

export default function HomePage() {
  const [contextId, setContextId] = useState<string | null>(null);
  const pipeline = usePipeline();

  const handleContextSaved = (id: string) => {
    setContextId(id);
    pipeline.startPipeline(id);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <motion.div
        className="max-w-2xl mx-auto px-4 py-10"
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={springGentle}
      >
        <div className="text-center mb-8">
          <Image
            src="/logo.jpg"
            alt="NicheOutreach Logo"
            width={72}
            height={72}
            className="mx-auto mb-4 rounded-2xl"
            priority
          />
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
      </motion.div>
    </div>
  );
}
