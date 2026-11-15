import { createElement, useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "../lib/gsap";
import { env } from "../state";

/** Cinematic word-mask heading reveal triggered on scroll. */
export function SplitHeading({
  text,
  as = "h2",
  className = "",
  delay = 0,
  start = "top 86%",
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (env.reduced || !ref.current) return;
    const ctx = gsap.context(() => {
      const words = ref.current!.querySelectorAll("[data-w]");
      gsap.fromTo(
        words,
        { yPercent: 115, rotate: 5 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.07,
          delay,
          scrollTrigger: { trigger: ref.current, start, once: true },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [delay, start]);

  const words = text.split(" ");
  return createElement(
    as,
    { ref, className, "aria-label": text },
    words.map((w, i) => (
      <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
        <span data-w className="inline-block will-change-transform">
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      </span>
    ))
  );
}

/** Fade / rise / unblur wrapper triggered on scroll. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 40,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (env.reduced || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { y, opacity: 0, filter: "blur(10px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.1,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [delay, y]);
  return createElement(as, { ref, className }, children);
}

export function SectionLabel({ n, text }: { n: string; text: string }) {
  return (
    <Reveal className="mb-6 flex items-center gap-4">
      <span className="hud text-glow">{n}</span>
      <span className="h-px w-12 bg-gradient-to-r from-glow to-transparent" />
      <span className="hud">{text}</span>
    </Reveal>
  );
}

/** Number counter that counts up when scrolled into view. */
export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (env.reduced) {
      el.textContent = to.toLocaleString() + suffix;
      return;
    }
    const o = { v: 0 };
    el.textContent = "0" + suffix;
    const ctx = gsap.context(() => {
      gsap.to(o, {
        v: to,
        duration: 2.2,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent = Math.round(o.v).toLocaleString() + suffix;
        },
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [to, suffix]);
  return <span ref={ref}>{to.toLocaleString() + suffix}</span>;
}
