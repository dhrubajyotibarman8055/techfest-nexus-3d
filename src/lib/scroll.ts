import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { env } from "../state";

let lenis: Lenis | null = null;

export function initScroll() {
  if (env.reduced) return () => {};
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (t: number) => lenis?.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

export function lockScroll(lock: boolean) {
  document.documentElement.classList.toggle("no-scroll", lock);
  if (lock) lenis?.stop();
  else lenis?.start();
}

export function scrollToId(id: string, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 2, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  } else {
    el.scrollIntoView({ behavior: env.reduced ? "auto" : "smooth" });
  }
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 2.4 });
  else window.scrollTo({ top: 0 });
}
