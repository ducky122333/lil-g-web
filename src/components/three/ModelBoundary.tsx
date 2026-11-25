"use client";

import { Component, type ReactNode } from "react";

/** Keeps the rest of the scene alive if the .glb is missing or fails to parse. */
export class ModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[lil-g-web] Hummingbird model failed to load:", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
