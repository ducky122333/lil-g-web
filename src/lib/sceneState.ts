/**
 * Mutable, frame-rate state shared between the DOM (scroll, pointer) and the
 * WebGL scene. Kept outside React so updates never trigger re-renders.
 */
export const sceneState = {
  /** Whole-page scroll progress, 0 → 1. */
  page: 0,
  /** Pinned chapters progress, 0 → 1. */
  chapters: 0,
  /** Normalised pointer, -1 → 1 on both axes. */
  pointer: { x: 0, y: 0 },
  /** Press energy, decays to 0 each frame. */
  press: 0,
  /** Mirrors prefers-reduced-motion. */
  reducedMotion: false,
};
