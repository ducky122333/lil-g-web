"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import { useApp } from "./AppProvider";
import { SplitChars } from "./SplitChars";

const CHAPTERS = [
  { label: "Studio", text: "Lil G Web. Design, 3D, and motion for the web.", accent: ["motion"] },
  { label: "Material", text: "Every surface catches the light differently.", accent: ["light"] },
  { label: "Craft", text: "Bespoke interfaces built to linger in memory.", accent: ["memory"] },
  { label: "Now", text: "Select commissions open. Tell us what you're imagining.", accent: ["imagining"] },
];

export function Chapters() {
  const root = useRef<HTMLElement>(null);
  const { reducedMotion } = useApp();

  useGSAP(
    () => {
      if (reducedMotion) return;

      const statements = gsap.utils.toArray<HTMLElement>(".chapter");
      const counter = root.current?.querySelector<HTMLElement>(".chapter-index");
      const labels = gsap.utils.toArray<HTMLElement>(".chapter-label");

      statements.forEach((el) => gsap.set(el.querySelectorAll(".char"), { yPercent: 120, rotateX: -70, opacity: 0 }));
      gsap.set(labels, { opacity: 0, y: 10 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 4.5}`,
          pin: true,
          scrub: 1,
          markers: false,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            sceneState.chapters = self.progress;
          },
        },
      });

      statements.forEach((el, i) => {
        const chars = el.querySelectorAll(".char");
        const at = `chapter-${i}`;
        tl.addLabel(at)
          .to(chars, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1, stagger: 0.018 }, at)
          .to(labels[i], { opacity: 1, y: 0, duration: 0.5 }, at)
          .call(
            () => {
              if (counter) counter.textContent = String(i + 1).padStart(2, "0");
            },
            undefined,
            at,
          )
          .to({}, { duration: 0.9 });

        if (i < statements.length - 1) {
          tl.to(chars, { yPercent: -110, rotateX: 60, opacity: 0, duration: 0.7, stagger: 0.01, ease: "power2.in" })
            .to(labels[i], { opacity: 0, y: -10, duration: 0.4 }, "<");
        }
      });

      tl.fromTo(".chapter-progress", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: tl.duration() }, 0);
    },
    { scope: root, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  if (reducedMotion) {
    return (
      <section aria-label="Studio chapters" className="relative z-10 space-y-[30vh] px-5 py-[30vh] md:px-10">
        {CHAPTERS.map((c) => (
          <p key={c.label} className="max-w-[18ch] font-display text-[9vw] leading-[1] text-ink md:text-[5.4vw]">
            {c.text}
          </p>
        ))}
      </section>
    );
  }

  return (
    <section ref={root} aria-label="Studio chapters" className="relative h-[100svh] overflow-hidden">
      <div className="absolute inset-x-5 top-24 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-ink/50 md:inset-x-10 md:top-28">
        <span>
          <span className="chapter-index tabular-nums text-ink">01</span> / {String(CHAPTERS.length).padStart(2, "0")}
        </span>
        <span className="relative h-4 w-28">
          {CHAPTERS.map((c) => (
            <span key={c.label} className="chapter-label absolute right-0 top-0">
              {c.label}
            </span>
          ))}
        </span>
      </div>

      <div className="absolute inset-0 flex items-center px-5 md:px-10">
        <div className="relative w-full [perspective:900px]">
          {CHAPTERS.map((c, i) => (
            <SplitChars
              key={c.label}
              as="p"
              text={c.text}
              accent={c.accent}
              className={`chapter ${i === 0 ? "relative" : "absolute inset-x-0 top-0"} max-w-[18ch] font-display text-[10vw] leading-[1] tracking-[-0.02em] text-ink md:text-[6vw]`}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-x-5 bottom-10 h-px bg-ink/10 md:inset-x-10">
        <div className="chapter-progress h-full origin-left bg-gradient-to-r from-amber via-violet to-cyan" />
      </div>
    </section>
  );
}
