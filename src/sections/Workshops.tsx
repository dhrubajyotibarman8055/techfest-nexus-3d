import { lazy, Suspense, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { EXPERIENCES } from "../data";
import { Reveal, SectionLabel, SplitHeading } from "../components/Reveal";
import { openRegister } from "../lib/register";

const Viewer = lazy(() => import("../scene/WorkshopViewer"));

export default function Workshops() {
  const [i, setI] = useState(0);
  const ex = EXPERIENCES[i];

  return (
    <section id="workshops" className="relative px-5 py-28 md:px-14 md:py-40">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/60 via-void/40 to-void/60" />
      <div className="relative mx-auto max-w-[1400px]">
        <SectionLabel n="03" text="Workshops & experiences" />
        <SplitHeading
          text="LEARN. TOUCH. EXPERIENCE."
          className="shadow-text max-w-4xl font-display text-[clamp(2.2rem,5.6vw,5rem)] font-black uppercase leading-[0.95] tracking-tight"
        />

        <div className="mt-14 grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          {/* selector */}
          <Reveal className="lg:col-span-5">
            <div role="tablist" aria-label="Experience categories" className="flex flex-col">
              {EXPERIENCES.map((e, idx) => {
                const on = idx === i;
                return (
                  <button
                    key={e.id}
                    role="tab"
                    aria-selected={on}
                    onClick={() => setI(idx)}
                    onMouseEnter={() => window.matchMedia("(hover:hover)").matches && setI(idx)}
                    className="group relative flex items-center gap-4 border-b border-white/10 py-4 text-left transition-colors md:py-5"
                    data-cursor="VIEW"
                  >
                    <span className="hud w-7" style={{ color: on ? e.color : undefined }}>0{idx + 1}</span>
                    <span
                      className={`font-display text-xl font-extrabold uppercase tracking-tight transition-all duration-500 md:text-3xl ${on ? "translate-x-2" : "text-white/45 group-hover:text-white/80"}`}
                    >
                      {e.name}
                    </span>
                    <e.Icon size={20} className="ml-auto transition-all duration-500" style={{ color: on ? e.color : "#9aa3c7", opacity: on ? 1 : 0.5 }} />
                    <span
                      className="absolute bottom-[-1px] left-0 h-px transition-all duration-700"
                      style={{ width: on ? "100%" : "0%", background: e.color, boxShadow: `0 0 12px ${e.color}` }}
                    />
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* viewer + details */}
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="glass relative overflow-hidden rounded-[2rem]">
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
                <div
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ background: `radial-gradient(60% 60% at 50% 50%, ${ex.color}30, transparent 70%)` }}
                />
                <div className="absolute inset-0" data-cursor="DRAG">
                  <Suspense fallback={<div className="flex h-full items-center justify-center hud">Loading 3D…</div>}>
                    <Viewer index={i} color={ex.color} />
                  </Suspense>
                </div>
                <span className="hud absolute left-5 top-5 !text-[10px]">Interactive · drag to rotate</span>
                <span className="hud absolute right-5 top-5 !text-[10px]" style={{ color: ex.color }}>{ex.meta}</span>
              </div>

              <div className="relative border-t border-white/10 p-6 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                  >
                    <p className="max-w-xl text-white/85">{ex.blurb}</p>
                    <ul className="mt-5 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                      {ex.items.map((it) => (
                        <li key={it} className="flex items-start gap-2.5 text-sm text-mute">
                          <Check size={15} className="mt-0.5 shrink-0" style={{ color: ex.color }} />
                          {it}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => openRegister()} className="btn btn-ghost mt-6 !py-3" style={{ borderColor: ex.color + "99" }} data-cursor="JOIN">
                      Reserve a spot <ArrowRight size={14} />
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
