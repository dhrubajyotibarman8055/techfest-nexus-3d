import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { env, state } from "../state";

const STATUS = ["INITIALIZING GRID", "COMPILING SHADERS", "LINKING NEURAL CORE", "SYNCING CITY LIGHTS", "READY FOR LAUNCH"];

export default function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const o = { v: 0 };
    let tweenDone = false;
    let finished = false;
    const t0 = performance.now();
    const set = () => setPct(Math.round(o.v));

    const tween = gsap.to(o, {
      v: 90,
      duration: env.reduced ? 0.4 : 2.4,
      ease: "power2.out",
      onUpdate: set,
      onComplete: () => (tweenDone = true),
    });

    let exitTl: gsap.core.Timeline | null = null;
    const exit = () => {
      exitTl = gsap.timeline({ onComplete: () => setGone(true) });
      exitTl
        .to(".loader-ui", { opacity: 0, y: -30, duration: 0.5, ease: "power2.in" })
        .add(() => onDone(), "-=0.1")
        .to(".loader-panel", { yPercent: -101, duration: env.reduced ? 0.01 : 1.1, ease: "expo.inOut", stagger: 0.07 }, "<");
    };

    const iv = setInterval(() => {
      if (finished) return;
      const fontsOk = document.fonts ? document.fonts.status === "loaded" || performance.now() - t0 > 3500 : true;
      if (tweenDone && fontsOk && (state.sceneReady || performance.now() - t0 > 7000)) {
        finished = true;
        clearInterval(iv);
        gsap.to(o, { v: 100, duration: 0.5, ease: "power2.inOut", onUpdate: set, onComplete: exit });
      }
    }, 100);

    return () => {
      clearInterval(iv);
      tween.kill();
      exitTl?.kill();
      gsap.killTweensOf(o);
    };
  }, [onDone]);

  if (gone) return null;
  const status = STATUS[Math.min(STATUS.length - 1, Math.floor((pct / 100) * STATUS.length))];

  return (
    <div ref={root} className="fixed inset-0 z-[100]" role="status" aria-live="polite" aria-label={`Loading ${pct}%`}>
      <div className="absolute inset-0 flex">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="loader-panel h-full flex-1 bg-void" style={{ boxShadow: "1px 0 0 rgba(53,224,255,.06)" }} />
        ))}
      </div>
      <div className="loader-ui absolute inset-0 flex flex-col items-center justify-center gap-10 px-6 text-center">
        <div className="cube-scene">
          <div className="cube">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className={`face f${n}`} />
            ))}
            <div className="cube inner">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className={`face f${n}`} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="font-display text-6xl font-black tracking-tight md:text-8xl">
            <span className="text-gradient">{String(pct).padStart(2, "0")}</span>
            <span className="text-2xl text-mute md:text-3xl">%</span>
          </div>
          <div className="mx-auto mt-6 h-px w-64 overflow-hidden bg-white/10 md:w-80">
            <div className="h-full bg-gradient-to-r from-glow via-volt to-neon" style={{ width: `${pct}%` }} />
          </div>
          <p className="hud mt-5">{status}</p>
        </div>
        <p className="hud absolute bottom-8 opacity-60">NEXUS TECHFEST · 2027</p>
      </div>
    </div>
  );
}
