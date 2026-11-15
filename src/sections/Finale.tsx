import { useEffect, useState } from "react";
import { ArrowUp, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { FEST } from "../data";
import { SOCIAL_ICONS } from "../components/Icons";
import { Logo } from "../components/Icons";
import { SplitHeading, Reveal } from "../components/Reveal";
import Magnetic from "../components/Magnetic";
import { openRegister } from "../lib/register";
import { scrollToId, scrollToTop } from "../lib/scroll";

function useCountdown(target: string) {
  const [left, setLeft] = useState(() => Math.max(0, new Date(target).getTime() - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, new Date(target).getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);
  const s = Math.floor(left / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export default function Finale() {
  const c = useCountdown(FEST.start);
  const units: [string, number][] = [["Days", c.d], ["Hours", c.h], ["Min", c.m], ["Sec", c.s]];

  return (
    <section id="contact" className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 pt-32 md:px-14">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-void/95" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center pb-24 text-center">
        <Reveal className="hud mb-8 flex items-center gap-3"><span className="dot" /> The portal is open</Reveal>
        <SplitHeading
          as="h2"
          text="THE FUTURE ISN'T WAITING."
          className="shadow-text font-display text-[clamp(2.4rem,7.4vw,7rem)] font-black uppercase leading-[0.95] tracking-tight"
        />
        <SplitHeading
          as="p"
          text="COME BUILD IT."
          delay={0.2}
          className="text-gradient font-display text-[clamp(2.4rem,7.4vw,7rem)] font-black uppercase leading-[0.95] tracking-tight"
        />

        <Reveal delay={0.1} className="mt-10 flex gap-3 md:gap-5" >
          <div className="flex gap-3 md:gap-5" role="timer" aria-label="Countdown to the festival">
            {units.map(([label, v]) => (
              <div key={label} className="glass min-w-[68px] rounded-2xl px-3 py-3 md:min-w-[104px] md:px-5 md:py-4">
                <div className="font-display text-2xl font-black tabular-nums md:text-5xl">{String(v).padStart(2, "0")}</div>
                <div className="hud mt-1 !text-[9px]">{label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Magnetic>
            <button onClick={() => openRegister()} className="btn btn-primary !px-10 !py-5 !text-[13px]" data-cursor="GO">
              Register now <ArrowUpRight size={16} />
            </button>
          </Magnetic>
          <button onClick={() => scrollToId("events")} className="btn btn-ghost !py-5">
            Browse events
          </button>
        </Reveal>
        <p className="hud mt-6">{FEST.dates} · {FEST.venue}</p>
      </div>

      {/* footer */}
      <footer className="relative z-10 mx-auto w-full max-w-[1400px] border-t border-white/10 pb-10 pt-10 backdrop-blur-sm md:pb-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <Logo size={30} />
              <span className="font-display text-base font-extrabold tracking-[0.2em]">{FEST.name} TECHFEST</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-mute">{FEST.tagline.toLowerCase().replace(/^./, (x) => x.toUpperCase())}. A festival of robotics, AI, code, games, ideas and circuits.</p>
            <div className="mt-6 flex gap-3">
              {FEST.socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.id];
                return (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-white/75 transition-all duration-300 hover:-translate-y-1 hover:border-glow hover:text-glow hover:shadow-[0_0_24px_-4px_rgba(53,224,255,0.7)]"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-4">
            <p className="hud mb-4 !text-white">Contact</p>
            <ul className="space-y-3 text-sm text-mute">
              <li><a href={`mailto:${FEST.email}`} className="flex items-center gap-3 transition hover:text-white"><Mail size={15} className="text-glow" />{FEST.email}</a></li>
              <li><a href={`tel:${FEST.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 transition hover:text-white"><Phone size={15} className="text-glow" />{FEST.phone}</a></li>
              <li className="flex items-start gap-3"><MapPin size={15} className="mt-0.5 shrink-0 text-glow" />{FEST.venue}, {FEST.city}</li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="hud mb-4 !text-white">Navigate</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-mute md:grid-cols-1">
              {[["about", "About"], ["events", "Events"], ["workshops", "Experiences"], ["schedule", "Schedule"], ["sponsors", "Partners"]].map(([id, l]) => (
                <li key={id}><button onClick={() => scrollToId(id)} className="transition hover:text-white">{l}</button></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="hud !text-[10px]">© 2027 {FEST.name} Techfest · Sample content — replace in src/data.ts</p>
          <button onClick={scrollToTop} className="hud flex items-center gap-2 !text-[10px] transition hover:!text-white" data-cursor="TOP">
            Back to top <ArrowUp size={13} />
          </button>
        </div>
      </footer>
    </section>
  );
}
