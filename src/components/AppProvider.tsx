"use client";

import type Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

type AppContextValue = {
  loaded: boolean;
  finishLoading: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  lenis: Lenis | null;
  setLenis: (lenis: Lenis | null) => void;
  reducedMotion: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const finishLoading = useCallback(() => setLoaded(true), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo(
    () => ({
      loaded,
      finishLoading,
      drawerOpen,
      openDrawer,
      closeDrawer,
      lenis,
      setLenis,
      reducedMotion,
    }),
    [loaded, finishLoading, drawerOpen, openDrawer, closeDrawer, lenis, reducedMotion],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
