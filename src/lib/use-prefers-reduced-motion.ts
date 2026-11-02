"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
// On the server, assume reduced motion so nothing animates before hydration.
const getServerSnapshot = () => true;

/** True when the user asked the OS to minimise motion. Updates live when the setting changes. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
