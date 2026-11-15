import { Component, lazy, Suspense, useMemo, type ReactNode } from "react";
import { state } from "../state";

const Scene = lazy(() => import("./Scene"));

function webglSupported() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Graceful CSS fallback if WebGL is missing or the scene crashes. */
function Fallback() {
  state.sceneReady = true;
  return (
    <div className="absolute inset-0 overflow-hidden bg-void" aria-hidden>
      <div
        className="absolute -inset-[10%]"
        style={{
          background:
            "radial-gradient(40% 40% at 70% 40%, rgba(47,107,255,.35), transparent 70%), radial-gradient(35% 35% at 20% 70%, rgba(139,92,246,.28), transparent 70%), radial-gradient(30% 30% at 50% 100%, rgba(53,224,255,.2), transparent 70%)",
          animation: "bg-drift 14s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn("3D scene failed, using fallback", err);
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children;
  }
}

export default function SceneRoot() {
  const ok = useMemo(webglSupported, []);
  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      {ok ? (
        <Boundary>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Boundary>
      ) : (
        <Fallback />
      )}
    </div>
  );
}
