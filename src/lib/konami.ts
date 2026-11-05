export const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

export function advanceKonami(progress: number, key: string): { progress: number; complete: boolean } {
  const normalized = key.length === 1 ? key.toLowerCase() : key;
  if (normalized === KONAMI[progress]) {
    const next = progress + 1;
    return next === KONAMI.length ? { progress: 0, complete: true } : { progress: next, complete: false };
  }
  return { progress: normalized === KONAMI[0] ? 1 : 0, complete: false };
}
