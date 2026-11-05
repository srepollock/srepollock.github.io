export const MAX_LEVEL = 3;

export type AdaptiveState = {
  level: number;
  slowWindows: number;
  fastWindows: number;
  lockedUntil: number;
};

export type QualityLevelEffects = {
  bloom: boolean;
  dprScale: number;
  pedestrians: boolean;
  carFraction: number;
};

export function initialAdaptive(level = MAX_LEVEL): AdaptiveState {
  return { level, slowWindows: 0, fastWindows: 0, lockedUntil: 0 };
}

export function adaptQuality(state: AdaptiveState, averageFps: number, targetFps: number, now: number): AdaptiveState {
  if (now < state.lockedUntil) return state;
  if (averageFps < targetFps * 0.85) {
    const slowWindows = state.slowWindows + 1;
    if (slowWindows >= 2 && state.level > 0) {
      return { level: state.level - 1, slowWindows: 0, fastWindows: 0, lockedUntil: now + 2 };
    }
    return { ...state, slowWindows, fastWindows: 0 };
  }
  if (averageFps > targetFps * 0.97) {
    const fastWindows = state.fastWindows + 1;
    if (fastWindows >= 6 && state.level < MAX_LEVEL) {
      return { level: state.level + 1, slowWindows: 0, fastWindows: 0, lockedUntil: now + 8 };
    }
    return { ...state, fastWindows, slowWindows: 0 };
  }
  return { ...state, slowWindows: 0, fastWindows: 0 };
}

export function levelEffects(level: number): QualityLevelEffects {
  return {
    bloom: level >= 3,
    dprScale: level >= 2 ? 1 : 0.75,
    pedestrians: level >= 1,
    carFraction: level >= 1 ? 1 : 0.5,
  };
}
