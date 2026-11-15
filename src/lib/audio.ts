// Tiny procedural audio engine: ambient drone + UI blips. Off by default (autoplay policies).
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let on = false;

export const soundOn = () => on;

export async function toggleSound(): Promise<boolean> {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 420;
      filter.Q.value = 4;
      filter.connect(master);
      [55, 82.41, 110.5, 164.8, 220.4].forEach((f, i) => {
        const o = ctx!.createOscillator();
        o.type = i % 2 ? "triangle" : "sine";
        o.frequency.value = f;
        o.detune.value = (i - 2) * 7;
        const g = ctx!.createGain();
        g.gain.value = 0.3 / (i + 1);
        o.connect(g);
        g.connect(filter);
        o.start();
      });
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      const lg = ctx.createGain();
      lg.gain.value = 260;
      lfo.connect(lg);
      lg.connect(filter.frequency);
      lfo.start();
    }
    on = !on;
    await ctx.resume();
    master!.gain.cancelScheduledValues(ctx.currentTime);
    master!.gain.linearRampToValueAtTime(on ? 0.2 : 0, ctx.currentTime + 1.2);
    if (on) blip(660, 0.05);
  } catch {
    on = false;
  }
  return on;
}

export function blip(freq = 880, vol = 0.03) {
  if (!on || !ctx || !master) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.08);
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.16);
}
