import { useLayoutEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight, MapPin, Calendar } from "lucide-react";
import { gsap } from "../lib/gsap";
import { FEST } from "../data";
import { env } from "../state";
import { scrollToId } from "../lib/scroll";
import { openRegister } from "../lib/register";
import Magnetic from "../components/Magnetic";

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (env.reduced) return;
    const ctx = gsap.context(() => {
      gsap.set("[data-line]", { yPercent: 115 });
      gsap.set("[data-fade]", { opacity: 0, y: 30 });
      tl.current = gsap
        .timeline({ paused: true })
        .to("[data-line]", { yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.14 })
        .to("[data-fade]", { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.1 }, "-=1.1");

      // scroll-out: title drifts and fades as you leave the hero
      gsap.to("[data-hero-copy]", {
        yPercent: -22,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom 20%", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (ready) tl.current?.play();
  }, [ready]);

  return (
    <section ref={root} id="hero" className="relative flex min-h-[100svh] items-end px-5 pb-28 pt-32 md:items-center md:px-14 md:pb-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-void/40 md:bg-gradient-to-r md:from-void/70 md:via-void/10 md:to-transparent" />

      <div data-hero-copy className="relative z-10 w-full max-w-[1500px]">
        <p data-fade className="hud mb-6 flex items-center gap-3 md:mb-8">
          <span className="dot" /> {FEST.edition} · Edition 04
        </p>

        <h1 className="font-display font-black uppercase leading-[0.88] tracking-tight text-[clamp(3.4rem,13vw,12.5rem)]" aria-label="Techfest">
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-line className="block">TECH</span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-line className="block text-gradient">FEST</span>
          </span>
        </h1>

        <p data-fade className="hud mt-6 !text-sm !tracking-[0.42em] !text-white md:mt-8 md:!text-base">
          {FEST.tagline}
        </p>
        <p data-fade className="mt-4 max-w-md text-[15px] leading-relaxed text-mute md:text-base">
          Fly through a living digital city of robots, algorithms and big ideas. Three days. Six arenas. One Nexus.
        </p>

        <div data-fade className="mt-9 flex flex-wrap items-center gap-4">
          <Magnetic>
            <button onClick={() => scrollToId("about")} className="btn btn-primary" data-cursor="DIVE">
              Explore experience <ArrowDown size={15} />
            </button>
          </Magnetic>
          <button onClick={() => openRegister()} className="btn btn-ghost">
            Register <ArrowUpRight size={15} />
          </button>
        </div>
      </div>

      <div data-fade className="absolute bottom-7 right-5 z-10 hidden flex-col items-end gap-2 md:flex md:right-14 lg:right-24">
        <p className="hud flex items-center gap-2"><Calendar size={13} className="text-glow" /> {FEST.dates}</p>
        <p className="hud flex items-center gap-2"><MapPin size={13} className="text-glow" /> {FEST.venue}</p>
      </div>

      <button
        data-fade
        onClick={() => scrollToId("about")}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 md:bottom-7"
        aria-label="Scroll down"
      >
        <span className="hud !text-[10px]">Scroll</span>
        <span className="relative block h-12 w-px overflow-hidden bg-white/15">
          <span className="absolute inset-0 bg-glow" style={{ animation: "scroll-line 2s cubic-bezier(.7,0,.3,1) infinite" }} />
        </span>
      </button>
    </section>
  );
}
