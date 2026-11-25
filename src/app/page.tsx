import { Chapters } from "@/components/Chapters";
import { ClosingCTA } from "@/components/ClosingCTA";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <Chapters />
      <ClosingCTA />
      <footer className="relative flex flex-col gap-3 border-t border-ink/10 px-5 py-8 hud md:flex-row md:items-center md:justify-between md:px-10">
        <span>© 2026 Lil G Web</span>
        <span>Design · 3D · Motion</span>
      </footer>
    </>
  );
}
