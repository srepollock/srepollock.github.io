import { showToast } from "@/lib/extras";

const calls = [
  "🥍 Flag down — 30-second delay of game on whoever typed that.",
  "🥍 Play on! (The referee saw nothing. The referee sees everything.)",
  "🥍 Two minutes for slashing. Your keyboard, specifically.",
];

let callIndex = 0;

function playWhistle(): void {
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const blasts = [0, 0.32, 0.64];
  for (const start of blasts) {
    const at = context.currentTime + start;
    const tone = context.createOscillator();
    const trill = context.createOscillator();
    const trillDepth = context.createGain();
    const volume = context.createGain();
    tone.type = "sine";
    tone.frequency.value = 2900;
    trill.frequency.value = 32;
    trillDepth.gain.value = 180;
    trill.connect(trillDepth).connect(tone.frequency);
    volume.gain.setValueAtTime(0, at);
    volume.gain.linearRampToValueAtTime(0.12, at + 0.02);
    volume.gain.setValueAtTime(0.12, at + 0.2);
    volume.gain.linearRampToValueAtTime(0, at + 0.26);
    tone.connect(volume).connect(context.destination);
    tone.start(at);
    trill.start(at);
    tone.stop(at + 0.28);
    trill.stop(at + 0.28);
  }
  window.setTimeout(() => void context.close(), 1500);
}

function bounceBall(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ball = document.createElement("div");
  ball.className = "lacrosse-ball";
  ball.setAttribute("aria-hidden", "true");
  document.body.append(ball);
  ball.addEventListener("animationend", () => ball.remove(), { once: true });
}

export function blowWhistle(): void {
  try {
    playWhistle();
  } catch {
    // Audio is a bonus; a blocked or missing AudioContext shouldn't break the joke.
  }
  bounceBall();
  showToast(calls[callIndex % calls.length] ?? "");
  callIndex += 1;
}
