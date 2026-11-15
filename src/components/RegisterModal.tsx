import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, X } from "lucide-react";
import { EVENTS, FEST } from "../data";
import { lockScroll } from "../lib/scroll";

type Ticket = { code: string; name: string; interest: string };

function Barcode({ code }: { code: string }) {
  const cells = useMemo(() => {
    let h = 0;
    for (const c of code) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const out: boolean[] = [];
    for (let i = 0; i < 49; i++) {
      h = (h * 1664525 + 1013904223) >>> 0;
      out.push((h >>> 16) % 2 === 0);
    }
    return out;
  }, [code]);
  return (
    <svg viewBox="0 0 7 7" className="h-20 w-20 rounded-md bg-white p-1.5" aria-hidden>
      {cells.map((on, i) => (on ? <rect key={i} x={i % 7} y={Math.floor(i / 7)} width="1" height="1" fill="#04050c" /> : null))}
    </svg>
  );
}

export default function RegisterModal() {
  const [open, setOpen] = useState(false);
  const [interest, setInterest] = useState("general");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const h = (e: Event) => {
      const id = (e as CustomEvent).detail?.eventId as string | undefined;
      setInterest(id || "general");
      setTicket(null);
      setErrors({});
      setOpen(true);
    };
    window.addEventListener("open-register", h);
    return () => window.removeEventListener("open-register", h);
  }, []);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (open || wasOpen.current) lockScroll(open);
    wasOpen.current = open;
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const email = String(f.get("email") || "").trim();
    const college = String(f.get("college") || "").trim();
    const err: Record<string, string> = {};
    if (name.length < 2) err.name = "Please enter your name";
    if (!/^\S+@\S+\.\S+$/.test(email)) err.email = "Enter a valid email";
    if (college.length < 2) err.college = "Tell us where you study / work";
    setErrors(err);
    if (Object.keys(err).length) return;

    const code = "NXS-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    try {
      const prev = JSON.parse(localStorage.getItem("nexus_registrations") || "[]");
      prev.push({ code, name, email, college, interest, at: new Date().toISOString() });
      localStorage.setItem("nexus_registrations", JSON.stringify(prev));
    } catch {
      /* storage unavailable — ignore */
    }
    setTicket({ code, name, interest: interest === "general" ? "General Pass" : EVENTS.find((x) => x.id === interest)?.name || "General Pass" });
  };

  const field =
    "w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-mute/60 outline-none transition focus:border-glow focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgba(53,224,255,0.12)]";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-end justify-center bg-void/80 p-0 backdrop-blur-md sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
          data-lenis-prevent
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reg-title"
            className="glass relative max-h-[94svh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-6 sm:rounded-3xl sm:p-9"
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-mute transition hover:border-glow hover:text-white" aria-label="Close registration">
              <X size={18} />
            </button>

            {!ticket ? (
              <form onSubmit={submit} noValidate>
                <p className="hud mb-3 text-glow">{FEST.edition} · {FEST.dates}</p>
                <h2 id="reg-title" className="font-display text-3xl font-extrabold leading-tight">
                  Claim your <span className="text-gradient">pass</span>
                </h2>
                <p className="mt-3 text-sm text-mute">Free entry demo flow — registrations are stored locally in your browser. Connect your own form with <code className="text-glow">VITE_REGISTER_URL</code>.</p>

                <div className="mt-7 space-y-4">
                  <div>
                    <input name="name" autoComplete="name" placeholder="Full name" className={field} aria-label="Full name" aria-invalid={!!errors.name} />
                    {errors.name && <p className="mt-1.5 text-xs text-[#ff6b8a]">{errors.name}</p>}
                  </div>
                  <div>
                    <input name="email" type="email" autoComplete="email" placeholder="Email address" className={field} aria-label="Email" aria-invalid={!!errors.email} />
                    {errors.email && <p className="mt-1.5 text-xs text-[#ff6b8a]">{errors.email}</p>}
                  </div>
                  <div>
                    <input name="college" autoComplete="organization" placeholder="College / Organisation" className={field} aria-label="College or organisation" aria-invalid={!!errors.college} />
                    {errors.college && <p className="mt-1.5 text-xs text-[#ff6b8a]">{errors.college}</p>}
                  </div>
                  <select value={interest} onChange={(e) => setInterest(e.target.value)} className={field + " appearance-none"} aria-label="Primary interest">
                    <option value="general" className="bg-ink">General pass — explore everything</option>
                    {EVENTS.map((e) => (
                      <option key={e.id} value={e.id} className="bg-ink">
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary mt-7 w-full">
                  Generate my pass
                </button>
              </form>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-glow/15 text-glow">
                  <Check />
                </div>
                <h2 id="reg-title" className="font-display text-3xl font-extrabold">
                  You’re <span className="text-gradient">in</span>, {ticket.name.split(" ")[0]}.
                </h2>
                <p className="mt-3 text-sm text-mute">Your pass is ready. Keep this code handy — see you at the Arena.</p>
                <div className="relative mt-7 flex items-center gap-5 overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-volt/25 via-ink to-neon/25 p-5">
                  <Barcode code={ticket.code} />
                  <div className="min-w-0">
                    <p className="hud !text-[10px]">{ticket.interest}</p>
                    <p className="mt-1 font-display text-2xl font-extrabold tracking-wider">{ticket.code}</p>
                    <p className="hud mt-2 !text-[10px]">{FEST.dates}</p>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    className="btn btn-ghost flex-1"
                    onClick={() => {
                      navigator.clipboard?.writeText(ticket.code).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1800);
                      });
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy code"}
                  </button>
                  <button className="btn btn-primary flex-1" onClick={() => setOpen(false)}>
                    Back to the city
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
