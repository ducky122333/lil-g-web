"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useApp } from "./AppProvider";
import { SplitChars } from "./SplitChars";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { loaded, reducedMotion } = useApp();

  useGSAP(
    () => {
      const headline = gsap.utils.toArray<HTMLElement>(".hero-title .char");
      const sub = gsap.utils.toArray<HTMLElement>(".hero-sub .char");

      if (reducedMotion) {
        gsap.set([headline, sub], { opacity: loaded ? 1 : 0 });
        return;
      }

      if (!loaded) {
        gsap.set(headline, { yPercent: 115, rotate: 8, opacity: 0 });
        gsap.set(sub, { yPercent: 100, opacity: 0 });
        return;
      }

      gsap
        .timeline({ defaults: { ease: "expo.out" }, delay: 0.25 })
        .to(headline, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.4, stagger: 0.028 })
        .to(sub, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.012 }, "-=1.0");

      // Drift the hero copy away as the user starts scrolling.
      gsap.to(".hero-inner", {
        yPercent: -18,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 1, markers: false },
      });
    },
    { scope: root, dependencies: [loaded, reducedMotion], revertOnUpdate: true },
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[100svh] items-end px-5 pb-10 pt-28 md:px-10 md:pb-14"
    >
      <div className="hero-inner w-full">
        <h1 className="hero-title max-w-[14ch] font-display font-light tracking-[-0.04em] leading-[1.05] text-[12vw] text-ink md:text-[8.4vw]">
          <SplitChars text="Custom Design Art Projects." accent={["Projects"]} />
        </h1>
        <div className="mt-8 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:justify-between">
          <p className="hero-sub max-w-md text-lg text-ink/70 md:text-xl">
            <SplitChars text="Design, 3D, and interactive craft." />
          </p>
        </div>
      </div>
    </section>
  );
}
