"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import { useApp } from "./AppProvider";

/**
 * Lenis driven entirely by gsap.ticker — no separate requestAnimationFrame loop.
 * Scroll stays locked while the preloader runs or the drawer is open.
 */
export function SmoothScroll() {
  const { lenis, setLenis, loaded, drawerOpen, reducedMotion } = useApp();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const instance = new Lenis({
      autoRaf: false,
      lerp: reducedMotion ? 1 : 0.09,
      smoothWheel: !reducedMotion,
    });

    const onScroll = (l: Lenis) => {
      sceneState.page = l.progress || 0;
      ScrollTrigger.update();
    };
    instance.on("scroll", onScroll);

    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    setLenis(instance);
    sceneState.reducedMotion = reducedMotion;

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      setLenis(null);
    };
  }, [reducedMotion, setLenis]);

  useEffect(() => {
    if (!lenis) return;
    const locked = !loaded || drawerOpen;
    document.documentElement.classList.toggle("is-locked", locked);
    if (locked) lenis.stop();
    else lenis.start();
  }, [lenis, loaded, drawerOpen]);

  useEffect(() => {
    if (loaded) ScrollTrigger.refresh();
  }, [loaded]);

  return null;
}
