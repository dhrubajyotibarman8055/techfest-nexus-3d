import { useCallback, useEffect, useState } from "react";
import { ScrollTrigger } from "./lib/gsap";
import { initScroll, lockScroll } from "./lib/scroll";
import { env, measure, state } from "./state";
import SceneRoot from "./scene/SceneRoot";
import Loader from "./components/Loader";
import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import Hud from "./components/Hud";
import RegisterModal from "./components/RegisterModal";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Events from "./sections/Events";
import Workshops from "./sections/Workshops";
import Schedule from "./sections/Schedule";
import Sponsors from "./sections/Sponsors";
import Finale from "./sections/Finale";

export default function App() {
  const [ready, setReady] = useState(false);
  const onDone = useCallback(() => setReady(true), []);

  // smooth scroll + global input
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const destroy = initScroll();
    lockScroll(true);

    const move = (e: PointerEvent) => {
      state.mx = (e.clientX / window.innerWidth - 0.5) * 2;
      state.my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    const down = () => {
      // clicking while in the hero zone sends a shockwave through the core
      if (state.s < 0.6) state.pulse = 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });

    const onRefresh = () => measure();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    const ro = new ResizeObserver(() => measure());
    ro.observe(document.body);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      destroy();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (ready) {
      lockScroll(false);
      ScrollTrigger.refresh();
    }
  }, [ready]);

  return (
    <div className="relative min-h-screen bg-void text-white">
      <SceneRoot />
      <Loader onDone={onDone} />
      <Cursor />
      <Nav visible={ready} />
      <Hud visible={ready} />

      <main className="relative z-10" style={{ overflowX: "clip" }}>
        <Hero ready={ready || env.reduced} />
        <About />
        <Events />
        <Workshops />
        <Schedule />
        <Sponsors />
        <Finale />
      </main>

      <RegisterModal />
    </div>
  );
}
