"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useApp } from "./AppProvider";

const EASE = [0.22, 1, 0.36, 1] as const;

type Status = "idle" | "sending" | "sent";

export function InquiryDrawer() {
  const { drawerOpen, closeDrawer, reducedMotion } = useApp();
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>("input, button")?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [drawerOpen, closeDrawer]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setName(String(data.get("name") ?? "").split(" ")[0]);
    setStatus("sending");
    // Wire this to your form backend (e.g. a Route Handler or Formspree).
    window.setTimeout(() => setStatus("sent"), 900);
  };

  const close = () => {
    closeDrawer();
    if (status === "sent") window.setTimeout(() => setStatus("idle"), 600);
  };

  const duration = reducedMotion ? 0.15 : 0.75;

  return (
    <AnimatePresence>
      {drawerOpen && (
        <motion.div key="drawer" className="fixed inset-0 z-50" data-no-press>
          <motion.button
            type="button"
            aria-label="Close inquiry"
            className="absolute inset-0 h-full w-full cursor-default bg-obsidian/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration * 0.7 }}
            onClick={close}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-title"
            data-lenis-prevent
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-y-auto border-l border-ink/10 bg-[#0b0a12]/80 px-6 py-6 shadow-[-40px_0_120px_-20px_rgba(139,92,246,0.35)] backdrop-blur-2xl md:px-10 md:py-8"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration, ease: EASE }}
          >
            <div className="flex items-center justify-between">
              <span className="hud">New commission</span>
              <button type="button" onClick={close} className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/70 transition-colors hover:border-ink/40 hover:text-ink">
                Close
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {status !== "sent" ? (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  className="mt-12 flex flex-1 flex-col"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <h2 id="inquiry-title" className="text-5xl font-light leading-[1.05] tracking-[-0.04em] text-ink md:text-6xl">
                    Inquire about a <span className="text-iris">project</span>
                  </h2>
                  <p className="mt-4 max-w-sm text-ink/60">Tell us what you&rsquo;re imagining. We reply to every note within two working days.</p>

                  <div className="mt-10 space-y-7">
                    <Field label="Name" name="name" autoComplete="name" required />
                    <Field label="Email" name="email" type="email" autoComplete="email" required />
                    <label className="block">
                      <span className="field-label">Project Vision</span>
                      <textarea
                        name="vision"
                        required
                        rows={5}
                        placeholder="A product launch, a 3D world, a site that feels like an object…"
                        className="field-input resize-none"
                      />
                    </label>
                  </div>

                  <button type="submit" disabled={status === "sending"} className="glass-pill glass-pill--lg mt-10 self-start disabled:opacity-60">
                    <span className="relative z-10">{status === "sending" ? "Sending…" : "Send inquiry"}</span>
                    <span aria-hidden className="relative z-10">&rarr;</span>
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="sent"
                  role="status"
                  className="mt-12 flex flex-1 flex-col justify-center"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <div className="mb-8 h-16 w-16 rounded-full bg-[conic-gradient(from_120deg,#ffb347,#8b5cf6,#22d3ee,#ffb347)] p-px">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0b0a12] text-2xl text-ink">✓</div>
                  </div>
                  <h2 id="inquiry-title" className="text-5xl font-light leading-[1.05] tracking-[-0.04em] text-ink md:text-6xl">
                    Thank you{name ? `, ${name}` : ""}.
                  </h2>
                  <p className="mt-5 max-w-sm text-ink/60">Your vision is in. We&rsquo;ll be in touch within two working days to talk light, form, and motion.</p>
                  <button type="button" onClick={close} className="glass-pill mt-10 self-start">
                    <span className="relative z-10">Back to the glass</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input {...props} className="field-input" />
    </label>
  );
}
