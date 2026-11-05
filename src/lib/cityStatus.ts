"use client";

import { useSyncExternalStore } from "react";

export type CityStatus =
  | { state: "pending" }
  | { state: "ok" }
  | { state: "unsupported" }
  | { state: "failed"; reason: string };

const pending: CityStatus = { state: "pending" };
let status: CityStatus = pending;
const listeners = new Set<() => void>();

export function setCityStatus(next: CityStatus): void {
  if (next.state === status.state && (next.state !== "failed" || (status.state === "failed" && status.reason === next.reason))) {
    return;
  }
  status = next;
  listeners.forEach((listener) => listener());
}

export function useCityStatus(): CityStatus {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => status,
    () => pending,
  );
}
