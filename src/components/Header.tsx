"use client";

import { motion } from "framer-motion";
import { useApp } from "./AppProvider";

export function Header() {
  const { openDrawer, loaded, lenis } = useApp();

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 md:px-10 md:py-6"
      initial={{ opacity: 0, y: -16 }}
      animate={loaded ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          lenis?.scrollTo(0);
        }}
        className="font-display text-xl tracking-tight text-ink md:text-2xl"
      >
        Lil G Web
      </a>
      <button type="button" onClick={openDrawer} className="glass-pill">
        <span className="relative z-10">Start a project</span>
        <span aria-hidden className="relative z-10 inline-block h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_12px_#ffb347]" />
      </button>
    </motion.header>
  );
}
