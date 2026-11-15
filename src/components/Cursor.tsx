import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { blip } from "../lib/audio";
import { env } from "../state";

const INTERACTIVE = "a, button, [data-cursor], input, select, textarea, label, summary";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!env.fine) return;
    document.documentElement.classList.add("has-cursor");
    const d = dot.current!;
    const r = ring.current!;
    gsap.set([d, r], { xPercent: -50, yPercent: -50, opacity: 0 });
    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3" });
    let shown = false;

    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([d, r], { opacity: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest?.(INTERACTIVE) as HTMLElement | null;
      if (el) {
        const txt = el.dataset.cursor;
        if (label.current) label.current.textContent = txt && txt !== "true" ? txt : "";
        gsap.to(r, { scale: txt && txt !== "true" ? 2.6 : 1.8, backgroundColor: "rgba(53,224,255,0.12)", borderColor: "rgba(53,224,255,0.9)", duration: 0.35 });
        gsap.to(d, { scale: 0.4, duration: 0.3 });
        blip(1100, 0.015);
      } else {
        if (label.current) label.current.textContent = "";
        gsap.to(r, { scale: 1, backgroundColor: "rgba(53,224,255,0)", borderColor: "rgba(200,215,255,0.45)", duration: 0.35 });
        gsap.to(d, { scale: 1, duration: 0.3 });
      }
    };
    const down = () => gsap.to(r, { scale: "-=0.25", duration: 0.15 });
    const up = () => gsap.to(r, { scale: "+=0.25", duration: 0.2 });
    const leave = () => {
      shown = false;
      gsap.to([d, r], { opacity: 0, duration: 0.3 });
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  if (!env.fine) return null;
  return (
    <>
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[200] flex h-9 w-9 items-center justify-center rounded-full border"
        style={{ borderColor: "rgba(200,215,255,0.45)" }}
        aria-hidden
      >
        <span ref={label} className="hud !text-[5px] !tracking-[0.1em] text-white" />
      </div>
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[201] h-1.5 w-1.5 rounded-full bg-glow shadow-[0_0_12px_#35e0ff]" aria-hidden />
    </>
  );
}
