"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useApp } from "./AppProvider";

export function ClosingCTA() {
  const root = useRef<HTMLElement>(null);
  const { openDrawer, reducedMotion } = useApp();

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.from(".cta-reveal", {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 70%", markers: false },
      });
    },
    { scope: root, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 py-32 text-center md:px-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_50%,rgba(5,5,7,0.78),rgba(5,5,7,0.35)_60%,transparent_80%)]" />
      <p className="cta-reveal hud relative mb-8">Commissions · 2026</p>
      <h2 className="cta-reveal relative max-w-[16ch] font-display font-light tracking-[-0.04em] leading-[1.05] text-[10vw] text-ink md:text-[6.5vw]">
        Start a <span className="text-iris">conversation</span>.
      </h2>
      <button type="button" onClick={openDrawer} className="cta-reveal relative glass-pill glass-pill--lg mt-12">
        <span className="relative z-10">Inquire about a project</span>
        <span aria-hidden className="relative z-10 text-lg leading-none">&rarr;</span>
      </button>
    </section>
  );
}
