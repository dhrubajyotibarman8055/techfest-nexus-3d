import { useLayoutEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "../lib/gsap";
import { FEST, SPONSORS, type Sponsor } from "../data";
import { env } from "../state";
import { Reveal, SectionLabel, SplitHeading } from "../components/Reveal";

function Tile({ s, size }: { s: Sponsor; size: "lg" | "md" | "sm" }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--glare", "1");
    if (env.fine && !env.reduced) el.style.transform = `perspective(700px) rotateX(${(0.5 - py) * 14}deg) rotateY(${(px - 0.5) * 14}deg) translateZ(10px)`;
  };
  const leave = () => {
    const el = ref.current!;
    el.style.setProperty("--glare", "0");
    el.style.transform = "perspective(700px) rotateX(0) rotateY(0)";
  };
  const dim = size === "lg" ? "h-52 md:h-64" : size === "md" ? "h-40 md:h-48" : "h-32 md:h-40";
  return (
    <div data-tile className="[perspective:900px]">
      <div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={leave}
        className={`glare glass group relative flex ${dim} flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl transition-[transform,border-color] duration-300 hover:border-glow/50`}
        data-cursor="PARTNER"
        style={{ transformStyle: "preserve-3d" }}
      >
        <span className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-glow/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <s.Icon
          size={size === "lg" ? 54 : size === "md" ? 40 : 32}
          strokeWidth={1.3}
          className="text-white/70 transition-all duration-500 group-hover:text-glow group-hover:drop-shadow-[0_0_16px_rgba(53,224,255,0.9)]"
          style={{ transform: "translateZ(40px)" }}
        />
        <span className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-white/80 md:text-sm" style={{ transform: "translateZ(25px)" }}>
          {s.name}
        </span>
        <span className="hud absolute right-4 top-4 !text-[8px] opacity-50">Sample</span>
      </div>
    </div>
  );
}

export default function Sponsors() {
  const root = useRef<HTMLElement>(null);
  const title = SPONSORS.filter((s) => s.tier === "title");
  const assoc = SPONSORS.filter((s) => s.tier === "associate");
  const partners = SPONSORS.filter((s) => s.tier === "partner");

  useLayoutEffect(() => {
    if (env.reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-group]").forEach((g) => {
        gsap.from(g.querySelectorAll("[data-tile]"), {
          y: 90,
          z: -200,
          rotateX: -30,
          opacity: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: g, start: "top 85%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="sponsors" className="relative px-5 py-28 md:px-14 md:py-40">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/60 via-void/45 to-void/60" />
      <div className="relative mx-auto max-w-[1200px]">
        <SectionLabel n="05" text="Sponsors & partners" />
        <SplitHeading
          text="POWERED BY THE BOLD"
          className="shadow-text font-display text-[clamp(2.2rem,5.6vw,5rem)] font-black uppercase leading-[0.95] tracking-tight"
        />

        <div className="mt-14 space-y-10">
          <div data-group>
            <p className="hud mb-4 flex items-center gap-3"><span className="h-px w-8 bg-glow" /> Title partner</p>
            <div className="grid gap-5">{title.map((s) => <Tile key={s.name} s={s} size="lg" />)}</div>
          </div>
          <div data-group>
            <p className="hud mb-4 flex items-center gap-3"><span className="h-px w-8 bg-volt" /> Associate partners</p>
            <div className="grid gap-5 sm:grid-cols-3">{assoc.map((s) => <Tile key={s.name} s={s} size="md" />)}</div>
          </div>
          <div data-group>
            <p className="hud mb-4 flex items-center gap-3"><span className="h-px w-8 bg-neon" /> Partners</p>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">{partners.map((s) => <Tile key={s.name} s={s} size="sm" />)}</div>
          </div>
        </div>

        <Reveal className="mt-14 flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-8">
          <p className="max-w-md text-mute">Want your brand inside the city? Partner with NEXUS and reach thousands of builders.</p>
          <a href={`mailto:${FEST.email}?subject=Sponsorship%20enquiry%20-%20NEXUS%20Techfest`} className="btn btn-ghost" data-cursor="MAIL">
            Become a partner <ArrowUpRight size={14} />
          </a>
        </Reveal>
        <p className="hud mt-6 !text-[10px] opacity-60">* Sample sponsor names — replace in src/data.ts</p>
      </div>
    </section>
  );
}
