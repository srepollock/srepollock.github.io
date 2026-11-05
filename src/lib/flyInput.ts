export type Keys = {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  boost: boolean;
};

export const noKeys: Keys = { forward: false, back: false, left: false, right: false, up: false, down: false, boost: false };

// Shared mutable input state: written by keyboard listeners and the touch pad,
// read every frame by the free-fly camera. Deliberately not React state.
export const flyKeys: Keys = { ...noKeys };

export function resetFlyKeys(): void {
  Object.assign(flyKeys, noKeys);
}
