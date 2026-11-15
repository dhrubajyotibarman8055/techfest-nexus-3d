import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { SCHEDULE } from "../data";
import { env } from "../state";
import { SectionLabel, SplitHeading } from "../components/Reveal";

export default function Schedule() {
  const [day, setDay] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const d = SCHEDULE[day];

  // timeline progress + per-item activation, rebuilt whenever the day changes
  useLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (env.reduced) {
        gsap.set(fill.current, { scaleY: 1 });
        el.querySelectorAll("[data-item]").forEach((n) => n.classList.add("is-on"));
        return;
      }
      gsap.fromTo(
        fill.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 60%", scrub: 0.4 },
        }
      );
      el.querySelectorAll<HTMLElement>("[data-item]").forEach((n) => {
        ScrollTrigger.create({
          trigger: n,
          start: "top 62%",
          onEnter: () => n.classList.add("is-on"),
          onLeaveBack: () => n.classList.remove("is-on"),
        });
        gsap.fromTo(
          n.querySelector("[data-card]"),
          { opacity: 0, x: (n.dataset.side === "l" ? -1 : 1) * 40, rotateY: (n.dataset.side === "l" ? 1 : -1) * 12 },
          { opacity: 1, x: 0, rotateY: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: n, start: "top 88%", once: true } }
        );
      });
    }, el);
    const t = setTimeout(() => ScrollTrigger.refresh(), 60);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, [day]);

  return (
    <section id="schedule" className="relative px-5 py-28 md:px-14 md:py-40">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/70 via-void/30 to-void/60" />
      <div className="relative mx-auto max-w-[1200px]">
        <SectionLabel n="04" text="Schedule" />
        <SplitHeading
          text="THREE DAYS. ZERO DOWNTIME."
          className="shadow-text max-w-4xl font-display text-[clamp(2.2rem,5.6vw,5rem)] font-black uppercase leading-[0.95] tracking-tight"
        />

        <div role="tablist" aria-label="Festival days" className="mt-12 flex flex-wrap gap-3">
          {SCHEDULE.map((s, i) => (
            <button
              key={s.day}
              role="tab"
              aria-selected={i === day}
              onClick={() => setDay(i)}
              className={`group relative overflow-hidden rounded-2xl border px-6 py-4 text-left transition-all duration-500 ${i === day ? "border-glow/70 bg-glow/10 shadow-[0_0_40px_-8px_rgba(53,224,255,0.5)]" : "glass hover:border-white/30"}`}
              data-cursor="DAY"
            >
              <span className="hud !text-[10px]" style={{ color: i === day ? "#35e0ff" : undefined }}>{s.day} · {s.date}</span>
              <span className="mt-1 block font-display text-lg font-extrabold uppercase">{s.theme}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
          >
            <div ref={list} className="relative mt-16 pb-6">
              {/* spine */}
              <div className="absolute bottom-0 left-[15px] top-0 w-px bg-white/10 md:left-1/2 md:-translate-x-1/2" />
              <div
                ref={fill}
                className="absolute bottom-0 left-[15px] top-0 w-[2px] origin-top -translate-x-[0.5px] bg-gradient-to-b from-glow via-volt to-neon shadow-[0_0_16px_#35e0ff] md:left-1/2 md:-translate-x-1/2"
                style={{ transform: "scaleY(0)" }}
              />

              <ul className="space-y-8 md:space-y-4">
                {d.items.map((it, i) => {
                  const left = i % 2 === 0;
                  return (
                    <li
                      key={it.title}
                      data-item
                      data-side={left ? "l" : "r"}
                      className="group relative grid grid-cols-[32px_1fr] gap-5 md:grid-cols-2 md:gap-0"
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {/* node */}
                      <span className="absolute left-[15px] top-8 z-10 -translate-x-1/2 md:left-1/2">
                        <span className="block h-3 w-3 rounded-full border-2 border-white/30 bg-void transition-all duration-500 group-[.is-on]:border-glow group-[.is-on]:bg-glow group-[.is-on]:shadow-[0_0_18px_#35e0ff] group-hover:scale-150" />
                      </span>

                      <div className={`col-start-2 md:col-start-auto ${left ? "md:pr-14" : "md:col-start-2 md:pl-14"}`} style={{ perspective: 900 }}>
                        <div
                          data-card
                          className={`glass relative rounded-2xl p-5 transition-[border-color,box-shadow,translate] duration-500 md:p-6 ${hovered === i ? "!border-glow/60 -translate-y-1 shadow-[0_20px_60px_-20px_rgba(53,224,255,0.45)]" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-display text-3xl font-black text-gradient md:text-4xl">{it.time}</span>
                            <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/80">{it.tag}</span>
                          </div>
                          <h3 className="mt-4 font-display text-lg font-extrabold uppercase leading-tight md:text-xl">{it.title}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-mute">{it.desc}</p>
                          <p className="hud mt-4 flex items-center gap-2 !text-[10px]">
                            <MapPin size={12} className="text-glow" /> {it.venue}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
        <p className="hud mt-4 !text-[10px] opacity-60">* Sample schedule — edit in src/data.ts</p>
      </div>
    </section>
  );
}
