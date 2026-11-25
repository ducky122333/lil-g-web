"use client";

import { AnimatePresence, animate, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useApp } from "./AppProvider";

const EASE = [0.76, 0, 0.24, 1] as const;

export function Preloader() {
  const { loaded, finishLoading, reducedMotion } = useApp();
  const [progress, setProgress] = useState(0);
  const controls = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    const c = animate(0, 100, {
      duration: reducedMotion ? 0.6 : 2.8,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setProgress(Math.round(v)),
      onComplete: () => window.setTimeout(finishLoading, 250),
    });
    controls.current = c;
    return () => c.stop();
  }, [finishLoading, reducedMotion]);

  const skip = () => {
    controls.current?.stop();
    setProgress(100);
    finishLoading();
  };

  return (
    <AnimatePresence>
      {!loaded && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-obsidian px-6 py-6 md:px-10 md:py-8"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: reducedMotion ? 0.2 : 1.1, ease: EASE }}
          role="status"
          aria-live="polite"
          aria-label={`Entering Lil G Web, ${progress}%`}
        >
          <div className="hud flex items-center justify-between">
            <span>Lil G Web</span>
            <button
              type="button"
              onClick={skip}
              className="rounded-full border border-white/20 px-4 py-2 text-white/70 transition-colors hover:border-ink/40 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
            >
              Skip
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <motion.p
              className="text-2xl font-light tracking-[-0.03em] text-white/70 md:text-3xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              Entering Lil G Web
            </motion.p>
            <div className="flex items-end justify-between gap-6">
              <span
                className="text-[22vw] font-light leading-[0.85] tracking-[-0.05em] tabular-nums text-ink md:text-[14vw]"
                aria-hidden
              >
                {progress}
                <span className="text-iris">%</span>
              </span>
            </div>
            <div className="h-px w-full overflow-hidden bg-ink/10">
              <div
                className="h-full origin-left bg-gradient-to-r from-amber via-violet to-cyan"
                style={{ transform: `scaleX(${progress / 100})` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
