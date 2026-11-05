"use client";

import { useSyncExternalStore } from "react";
import type { DistrictId } from "./districts";

export type FlightStatus = { state: "idle" | "flying"; district: DistrictId | null };

const idle: FlightStatus = { state: "idle", district: null };
let status: FlightStatus = idle;
const listeners = new Set<() => void>();

export function setFlightStatus(next: FlightStatus): void {
  if (next.state === status.state && next.district === status.district) return;
  status = next;
  listeners.forEach((listener) => listener());
}

export function useFlightStatus(): FlightStatus {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => status,
    () => idle,
  );
}
