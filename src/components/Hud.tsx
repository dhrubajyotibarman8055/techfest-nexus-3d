import { useEffect, useRef, useState } from "react";
import { SECTION_IDS, ZONES, state } from "../state";
import { scrollToId } from "../lib/scroll";

const LABELS = ["Hero", "About", "Events", "Experiences", "Schedule", "Partners", "Contact"];

/** Scroll progress bar, zone read-out and side navigation dots. */
export default function Hud({ visible }: { visible: boolean }) {
  const [zone, setZone] = useState(0);
  const bar = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let last = -1;
    const loop = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
      const z = Math.min(SECTION_IDS.length - 1, Math.floor(state.s + 0.35));
      if (z !== last) {
        last = z;
        setZone(z);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="fixed inset-x-0 top-0 z-[80] h-[2px] bg-white/5">
        <div ref={bar} className="h-full origin-left bg-gradient-to-r from-glow via-volt to-neon" style={{ transform: "scaleX(0)" }} />
      </div>

      <nav aria-label="Sections" className="fixed right-5 top-1/2 z-[60] hidden -translate-y-1/2 flex-col items-end gap-4 lg:flex">
        {SECTION_IDS.map((id, i) => (
          <button key={id} onClick={() => scrollToId(id)} className="group flex items-center gap-3" aria-label={`Go to ${LABELS[i]}`} aria-current={zone === i}>
            <span className={`hud !text-[10px] transition-all duration-300 ${zone === i ? "translate-x-0 opacity-100 !text-white" : "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`}>
              {LABELS[i]}
            </span>
            <span className={`block rounded-full transition-all duration-500 ${zone === i ? "h-6 w-[3px] bg-glow shadow-[0_0_12px_#35e0ff]" : "h-[6px] w-[6px] bg-white/30 group-hover:bg-white"}`} />
          </button>
        ))}
      </nav>

      <div className="pointer-events-none fixed bottom-6 left-6 z-[60] hidden items-center gap-4 md:flex md:left-10" aria-hidden>
        <span className="hud !text-white">
          <span ref={pctRef}>000</span>
          <span className="text-mute">%</span>
        </span>
        <span className="h-px w-8 bg-white/25" />
        <span className="hud">
          ZONE 0{zone + 1} / {ZONES[zone]}
        </span>
      </div>
    </div>
  );
}
