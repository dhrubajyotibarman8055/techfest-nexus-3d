import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react";
import { Logo } from "./Icons";
import { FEST } from "../data";
import { scrollToId, scrollToTop } from "../lib/scroll";
import { openRegister } from "../lib/register";
import { blip, toggleSound } from "../lib/audio";

const LINKS = [
  { id: "about", label: "About" },
  { id: "events", label: "Events" },
  { id: "workshops", label: "Experiences" },
  { id: "schedule", label: "Schedule" },
  { id: "sponsors", label: "Partners" },
  { id: "contact", label: "Contact" },
];

export default function Nav({ visible }: { visible: boolean }) {
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    setTimeout(() => scrollToId(id), 350);
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[69] h-28 bg-gradient-to-b from-void/85 via-void/40 to-transparent" aria-hidden />
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={visible ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-[70] flex items-center justify-between px-5 py-5 md:px-10"
      >
        <button
          onClick={() => {
            setOpen(false);
            scrollToTop();
          }}
          className="group flex items-center gap-3"
          aria-label="NEXUS Techfest — back to top"
        >
          <Logo />
          <span className="font-display text-sm font-extrabold tracking-[0.2em]">
            {FEST.name}
            <span className="ml-2 text-mute font-normal">’27</span>
          </span>
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={async () => setSound(await toggleSound())}
            className="glass flex h-11 w-11 items-center justify-center rounded-full transition hover:border-glow/60"
            aria-label={sound ? "Mute ambient sound" : "Enable ambient sound"}
            aria-pressed={sound}
            data-cursor="SOUND"
          >
            {sound ? (
              <span className="flex h-4 items-end gap-[3px]" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="w-[2px] origin-bottom rounded bg-glow" style={{ height: "100%", animation: `bars ${0.7 + i * 0.15}s ease-in-out infinite` }} />
                ))}
              </span>
            ) : (
              <VolumeX size={16} className="text-mute" />
            )}
            <span className="sr-only">{sound ? <Volume2 /> : null}</span>
          </button>
          <button onClick={() => openRegister()} className="btn btn-primary hidden !py-3 sm:inline-flex" data-cursor="GO">
            Register <ArrowUpRight size={14} />
          </button>
          <button
            onClick={() => {
              setOpen((o) => !o);
              blip(500, 0.03);
            }}
            className="glass relative flex h-11 items-center gap-3 rounded-full pl-5 pr-4 transition hover:border-glow/60"
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className="hud !text-white">{open ? "Close" : "Menu"}</span>
            <span className="relative block h-3 w-5" aria-hidden>
              <span className={`absolute left-0 h-px w-5 bg-white transition-all duration-500 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-px bg-white transition-all duration-500 ${open ? "top-1.5 w-5 -rotate-45" : "top-3 w-3"}`} />
            </span>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="menu"
            aria-label="Main"
            className="fixed inset-0 z-[65] flex flex-col justify-center bg-void/92 px-6 backdrop-blur-xl md:px-20"
            initial={{ clipPath: "circle(0% at calc(100% - 60px) 44px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 60px) 44px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 60px) 44px)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="mx-auto w-full max-w-5xl">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.25 + i * 0.07, duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  className="border-b border-white/10"
                >
                  <button onClick={() => go(l.id)} className="group flex w-full items-center gap-5 py-3 text-left md:gap-8 md:py-4">
                    <span className="hud w-8 text-glow">0{i + 1}</span>
                    <span className="font-display text-3xl font-extrabold uppercase tracking-tight transition-all duration-500 group-hover:translate-x-4 group-hover:text-gradient md:text-6xl">
                      {l.label}
                    </span>
                    <ArrowUpRight className="ml-auto text-mute opacity-0 transition group-hover:opacity-100" />
                  </button>
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.8 } }}
              exit={{ opacity: 0 }}
              className="mx-auto mt-10 flex w-full max-w-5xl flex-wrap items-center justify-between gap-4"
            >
              <p className="hud">{FEST.dates} · {FEST.venue}</p>
              <button
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => openRegister(), 300);
                }}
                className="btn btn-primary"
              >
                Register now <ArrowUpRight size={14} />
              </button>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
