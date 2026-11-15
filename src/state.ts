// Shared, mutable runtime state. Read inside useFrame / rAF loops (no React re-renders).

export const SECTION_IDS = ["hero", "about", "events", "workshops", "schedule", "sponsors", "contact"] as const;
export const ZONES = [
  "NEXUS CORE",
  "GRID CITY",
  "ARENA RING",
  "SHARD FIELD",
  "TIME TUNNEL",
  "MONOLITH GATE",
  "THE PORTAL",
];

export const FOG = { color: "#04050c", near: 25, far: 130 };

const mq = (q: string) => typeof window !== "undefined" && window.matchMedia(q).matches;

export const env = {
  low: mq("(max-width: 767px)") || mq("(pointer: coarse)"),
  reduced: mq("(prefers-reduced-motion: reduce)"),
  fine: mq("(hover: hover) and (pointer: fine)"),
};

export const state = {
  s: 0, // raw scroll position expressed in "zone" units
  sSmooth: 0,
  vel: 0,
  mx: 0,
  my: 0,
  smx: 0,
  smy: 0,
  pulse: 0,
  activeEvent: 0,
  sceneReady: false,
  inited: false,
};

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const smooth = (t: number) => t * t * (3 - 2 * t);

// How much of each section the camera "holds" before travelling on to the next zone.
const HOLD = [0, 0, 0.8, 0, 0, 0, 0];

let tops: number[] = [];
let docEnd = 1;

export function measure() {
  tops = SECTION_IDS.map((id) => {
    const el = document.getElementById(id);
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  });
  docEnd = Math.max(document.documentElement.scrollHeight - window.innerHeight, (tops[tops.length - 1] || 0) + 1);
}

export function computeS() {
  const y = window.scrollY;
  if (!tops.length) measure();
  const n = tops.length;
  if (y >= tops[n - 1]) return n - 1 + clamp((y - tops[n - 1]) / Math.max(1, docEnd - tops[n - 1]), 0, 1);
  for (let i = n - 2; i >= 0; i--) {
    if (y >= tops[i]) {
      let l = (y - tops[i]) / Math.max(1, tops[i + 1] - tops[i]);
      const h = HOLD[i];
      if (h > 0) l = l < h ? 0 : smooth((l - h) / (1 - h));
      return i + l;
    }
  }
  return 0;
}
