import { useLayoutEffect, useRef } from "react";
import { Hammer, Swords, Users } from "lucide-react";
import { gsap } from "../lib/gsap";
import { STATS } from "../data";
import { env } from "../state";
import { Counter, Reveal, SectionLabel, SplitHeading } from "../components/Reveal";
import TiltCard from "../components/TiltCard";

const PANELS = [
  { n: "01", title: "Compete", text: "60+ contests across six arenas, with real stakes and louder crowds.", Icon: Swords, shift: -90, cls: "md:left-0 md:top-0" },
  { n: "02", title: "Build", text: "Workshops, labs and a 24-hour hackathon. Leave with something working.", Icon: Hammer, shift: 60, cls: "md:right-0 md:top-[170px]" },
  { n: "03", title: "Connect", text: "Meet founders, researchers and peers from 150+ colleges.", Icon: Users, shift: -40, cls: "md:left-[8%] md:top-[360px]" },
];

export default function About() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (env.reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((el) => {
        const shift = Number(el.dataset.shift || 0);
        gsap.fromTo(
          el,
          { y: -shift * 0.6 },
          { y: shift, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 } }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="about" className="relative px-5 py-28 md:px-14 md:py-40">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void/80 via-void/35 to-transparent" />
      <div className="relative mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionLabel n="01" text="About the fest" />
          <SplitHeading
            text="A CITY BUILT BY MAKERS"
            className="shadow-text font-display text-[clamp(2.3rem,6vw,5.5rem)] font-black uppercase leading-[0.95] tracking-tight"
          />
          <Reveal delay={0.1} className="mt-8 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">
            <p>
              NEXUS is a three-day technology festival where students, engineers and dreamers collide. Below you, the
              city is already awake — every light is a project, every tower an idea somebody refused to give up on.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-5 max-w-xl leading-relaxed text-mute">
            <p>
              Compete in robotics, AI, coding, gaming, innovation and electronics. Learn in hands-on labs. Walk through
              exhibitions that look like tomorrow. Then do it all again.
            </p>
          </Reveal>
        </div>

        {/* floating panels */}
        <div className="relative grid gap-5 md:block md:min-h-[560px] lg:col-span-6">
          {PANELS.map((p) => (
            <div key={p.n} data-panel data-shift={p.shift} className={`md:absolute md:w-[320px] ${p.cls}`}>
              <div className="float-y" style={{ animationDelay: `${Number(p.n) * -2}s` }}>
                <TiltCard className="glass rounded-3xl p-7" max={14}>
                  <div className="flex items-center justify-between" style={{ transform: "translateZ(30px)" }}>
                    <span className="hud text-glow">{p.n}</span>
                    <p.Icon className="text-glow" size={22} />
                  </div>
                  <h3 className="mt-8 font-display text-2xl font-extrabold uppercase" style={{ transform: "translateZ(50px)" }}>
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-mute" style={{ transform: "translateZ(20px)" }}>
                    {p.text}
                  </p>
                </TiltCard>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* stats */}
      <div className="relative mx-auto mt-24 grid max-w-[1400px] grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:mt-32 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="group relative bg-void/80 p-6 backdrop-blur-xl transition-colors duration-500 hover:bg-ink/90 md:p-10">
            <div className="font-display text-[clamp(2rem,4.6vw,4.2rem)] font-black leading-none tracking-tight">
              <span className="text-gradient">
                <Counter to={s.value} suffix={s.suffix} />
              </span>
            </div>
            <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.2em] md:text-sm">{s.label}</p>
            <p className="hud mt-1 !text-[10px]">{s.note}</p>
            <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-glow to-neon transition-transform duration-700 group-hover:scale-x-100" />
          </div>
        ))}
      </div>
      <p className="hud relative mx-auto mt-4 max-w-[1400px] !text-[10px] opacity-60">* Sample figures — edit in src/data.ts</p>
    </section>
  );
}
