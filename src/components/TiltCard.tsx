import { useRef, type CSSProperties, type ReactNode } from "react";
import { env } from "../state";

/** 3D tilt + glare card. Children may use translateZ() for depth since preserve-3d is on. */
export default function TiltCard({
  children,
  className = "",
  max = 12,
  style,
  onEnter,
  onLeave,
  as: _as,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  style?: CSSProperties;
  onEnter?: () => void;
  onLeave?: () => void;
  as?: never;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent) => {
    if (!env.fine || env.reduced || e.pointerType !== "mouse") return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.classList.remove("leaving");
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateZ(0)`;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--glare", "1");
  };
  const leave = () => {
    const el = ref.current!;
    el.classList.add("leaving");
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    el.style.setProperty("--glare", "0");
    onLeave?.();
  };

  return (
    <div
      ref={ref}
      className={`tilt glare relative ${className}`}
      style={style}
      onPointerMove={move}
      onPointerEnter={onEnter}
      onPointerLeave={leave}
    >
      {children}
    </div>
  );
}
