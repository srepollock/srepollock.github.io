"use client";

import { createStore } from "./store";

export const freeFly = createStore(false);

export type Toast = { id: number; text: string };
export const toast = createStore<Toast | null>(null);

let toastId = 0;
export function showToast(text: string): void {
  toastId += 1;
  toast.set({ id: toastId, text });
}

export type CityEvent = { id: number; kind: "shred" };
export const cityEvent = createStore<CityEvent | null>(null);

let eventId = 0;
export function emitCityEvent(kind: CityEvent["kind"]): void {
  eventId += 1;
  cityEvent.set({ id: eventId, kind });
}
