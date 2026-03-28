"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAnimationStore } from "@/stores/animation-store";
import { springFly } from "@/lib/motion";

export function FlyAnimationLayer() {
  const flyQueue = useAnimationStore((s) => s.flyQueue);
  const shortlistIconRect = useAnimationStore((s) => s.shortlistIconRect);
  const dequeueFly = useAnimationStore((s) => s.dequeueFly);
  const triggerWobble = useAnimationStore((s) => s.triggerWobble);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence>
        {flyQueue.map((item) => {
          const target = shortlistIconRect;
          if (!target) return null;

          const startX = item.sourceRect.left;
          const startY = item.sourceRect.top;
          const endX = target.left + target.width / 2 - item.sourceRect.width / 2;
          const endY = target.top + target.height / 2 - item.sourceRect.height / 2;
          const arcPeakY = Math.min(startY, endY) - 120;

          return (
            <motion.div
              key={item.id}
              initial={{
                x: startX,
                y: startY,
                width: item.sourceRect.width,
                height: item.sourceRect.height,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: endX,
                y: [startY, arcPeakY, endY],
                scale: 0.15,
                opacity: [1, 0.8, 0.4],
              }}
              transition={{
                x: springFly,
                y: {
                  type: "spring",
                  stiffness: 200,
                  damping: 26,
                  mass: 0.6,
                },
                scale: { ...springFly, duration: 0.5 },
                opacity: { duration: 0.45, ease: "easeOut" },
              }}
              onAnimationComplete={() => {
                dequeueFly(item.id);
                triggerWobble();
              }}
              className="absolute top-0 left-0 rounded-lg bg-card border border-border shadow-lg overflow-hidden"
            >
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-foreground truncate">
                    {item.channelName}
                  </span>
                  <span className="text-xs font-mono font-medium text-primary">
                    {item.score}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
