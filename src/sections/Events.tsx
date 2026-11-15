import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { EVENTS } from "../data";
import { env, state } from "../state";
import { openRegister } from "../lib/register";
import { SplitHeading } from "../components/Reveal";
import TiltCard from "../components/TiltCard";

/**
 * Pinned (CSS sticky) section with horizontal scrolling cards driven by GSAP ScrollTrigger.
 * The progress rotates the 3D arena ring so the active category's object faces the camera.
 */
export default function Events() {
  const outer = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [progressActive, setProgressActive] = useState(0);
  const [hover, setHover] = useState(-1);
  const active = hover >= 0 ? hover : progressActive;

  useEffect(() => {
    state.activeEvent = active;
  }, [active]);

  // outer height = viewport + horizontal distance
  useLayoutEffect(() => {
    const el = outer.current!;
    const setH = () => {
      const dist = Math.max(0, track.current!.scrollWidth - window.innerWidth);
      el.style.height = `${window.innerHeight + dist * 1.15}px`;
    };
    setH();
    ScrollTrigger.addEventListener("refreshInit", setH);
    return () => ScrollTrigger.removeEventListener("refreshInit", setH);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const dist = () => Math.max(0, track.current!.scrollWidth - window.innerWidth);
      gsap.to(track.current, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: outer.current,
          start: "top top",
          end: "bottom bottom",
          scrub: env.reduced ? true : 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.round(self.progress * (EVENTS.length - 1));
            setProgressActive((p) => (p === idx ? p : idx));
            const bar = document.getElementById("events-bar");
            if (bar) bar.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
    }, outer);
    return () => ctx.revert();
  }, []);

  const ev = EVENTS[active];

  return (
    <section ref={outer} id="events" className="relative" aria-label="Events and competitions">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between overflow-hidden pb-6 pt-24 md:pb-10 md:pt-28">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-void/90 via-void/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-void/70 to-transparent" />

        <div className="relative z-10 flex items-start justify-between gap-6 px-5 md:px-14">
          <div>
            <p className="mb-3 flex items-center gap-4">
              <span className="hud text-glow">02</span>
              <span className="h-px w-12 bg-gradient-to-r from-glow to-transparent" />
              <span className="hud">Events & competitions</span>
            </p>
            <SplitHeading
              text="CHOOSE YOUR ARENA"
              className="shadow-text font-display text-[clamp(1.7rem,4.2vw,3.6rem)] font-black uppercase leading-none tracking-tight"
            />
          </div>
          <div className="text-right">
            <p className="font-display text-4xl font-black leading-none md:text-6xl" style={{ color: ev.color, transition: "color .5s" }}>
              {String(active + 1).padStart(2, "0")}
              <span className="text-lg text-mute md:text-2xl"> / {String(EVENTS.length).padStart(2, "0")}</span>
            </p>
            <p className="hud mt-2 !text-white">{ev.name}</p>
          </div>
        </div>

        <div className="relative z-10">
          <div ref={track} className="flex w-max gap-4 px-5 md:gap-6 md:px-14">
            {EVENTS.map((e, i) => {
              const isActive = i === active;
              return (
                <TiltCard
                  key={e.id}
                  onEnter={() => setHover(i)}
                  onLeave={() => setHover(-1)}
                  className="w-[80vw] shrink-0 sm:w-[360px] md:w-[400px]"
                >
                  <article
                    className="glass relative flex h-full flex-col overflow-hidden rounded-3xl p-6 transition-all duration-500 md:p-7"
                    style={{
                      borderColor: isActive ? e.color : undefined,
                      boxShadow: isActive ? `0 0 0 1px ${e.color}55, 0 30px 80px -30px ${e.color}88` : undefined,
                      transform: isActive ? "translateY(-8px)" : undefined,
                    }}
                  >
                    <div
                      className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl transition-opacity duration-500"
                      style={{ background: e.color, opacity: isActive ? 0.35 : 0.08 }}
                    />
                    <div className="flex items-center justify-between" style={{ transform: "translateZ(30px)" }}>
                      <span className="hud !text-white">0{i + 1}</span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border" style={{ borderColor: e.color + "88", color: e.color }}>
                        <e.Icon size={20} />
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-extrabold uppercase tracking-tight md:text-3xl" style={{ transform: "translateZ(50px)" }}>
                      {e.name}
                    </h3>
                    <p className="hud mt-2 !text-[10px]" style={{ color: e.color }}>
                      {e.tagline}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-mute md:min-h-[63px]" style={{ transform: "translateZ(15px)" }}>
                      {e.desc}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {e.tags.map((t) => (
                        <span key={t} className="rounded-full border border-white/12 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/75">
                          {t}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => openRegister(e.id)}
                      className="btn btn-ghost mt-5 !py-3 self-start"
                      style={{ borderColor: isActive ? e.color : undefined }}
                      data-cursor="JOIN"
                    >
                      Register for {e.name} <ArrowUpRight size={14} />
                    </button>
                  </article>
                </TiltCard>
              );
            })}
            <div className="w-[10vw] shrink-0" aria-hidden />
          </div>

          <div className="mt-6 flex items-center gap-4 px-5 md:px-14">
            <span className="hud !text-[10px]">Scroll →</span>
            <div className="h-px flex-1 bg-white/10">
              <div id="events-bar" className="h-full origin-left bg-gradient-to-r from-glow to-neon" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
