import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EVENTS } from "../data";
import { damp, env, state } from "../state";

const R = 7;
const hdr = (c: string, k = 3) => new THREE.Color(c).multiplyScalar(k);

type MatLike = THREE.MeshStandardMaterial;

function Metal({ color, emissive = 0.5 }: { color: string; emissive?: number }) {
  return <meshStandardMaterial color="#10162f" metalness={1} roughness={0.18} emissive={color} emissiveIntensity={emissive} envMapIntensity={1.6} />;
}

function Robotics({ color, spin }: { color: string; spin: React.RefObject<THREE.Group | null> }) {
  const teeth = useMemo(() => Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2), []);
  return (
    <group rotation={[0.4, 0.5, 0]}>
      <group ref={spin}>
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.78, 0.78, 0.36, 32]} />
          <Metal color={color} />
        </mesh>
        {teeth.map((a) => (
          <mesh key={a} position={[Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0]} rotation-z={a}>
            <boxGeometry args={[0.3, 0.3, 0.36]} />
            <Metal color={color} />
          </mesh>
        ))}
        <mesh>
          <torusGeometry args={[0.4, 0.06, 12, 32]} />
          <meshBasicMaterial color={hdr(color)} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function AI({ color, spin }: { color: string; spin: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={spin}>
      <mesh>
        <icosahedronGeometry args={[0.85, 0]} />
        <Metal color={color} emissive={0.25} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshBasicMaterial color={hdr(color, 2)} wireframe toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial color={hdr(color, 4)} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Coding({ color, spin }: { color: string; spin: React.RefObject<THREE.Group | null> }) {
  const cubes = useMemo(() => {
    const a: [number, number, number][] = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) if (x || y || z) a.push([x, y, z]);
    return a;
  }, []);
  return (
    <group ref={spin} scale={0.9}>
      {cubes.map(([x, y, z], i) => (
        <mesh key={i} position={[x * 0.5, y * 0.5, z * 0.5]}>
          <boxGeometry args={[0.36, 0.36, 0.36]} />
          <Metal color={color} emissive={(x + y + z) % 2 ? 0.9 : 0.25} />
        </mesh>
      ))}
    </group>
  );
}

function Gaming({ color, spin }: { color: string; spin: React.RefObject<THREE.Group | null> }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.04, 0)), []);
  return (
    <group ref={spin}>
      <mesh>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#12122e" metalness={0.9} roughness={0.2} emissive={color} emissiveIntensity={0.35} flatShading />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={hdr(color, 3)} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

function Innovation({ color, spin }: { color: string; spin: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={spin}>
      <mesh>
        <torusKnotGeometry args={[0.6, 0.2, 160, 20]} />
        <Metal color={color} emissive={0.5} />
      </mesh>
    </group>
  );
}

function Electronics({ color, spin }: { color: string; spin: React.RefObject<THREE.Group | null> }) {
  const pins = useMemo(() => {
    const a: { p: [number, number, number]; r: boolean }[] = [];
    for (let i = 0; i < 6; i++) {
      const o = -0.5 + i * 0.2;
      a.push({ p: [o, 0, 0.78], r: false }, { p: [o, 0, -0.78], r: false }, { p: [0.78, 0, o], r: true }, { p: [-0.78, 0, o], r: true });
    }
    return a;
  }, []);
  return (
    <group rotation={[0.7, 0, 0]}>
      <group ref={spin}>
        <mesh>
          <boxGeometry args={[1.3, 0.16, 1.3]} />
          <Metal color={color} emissive={0.2} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.7, 0.14, 0.7]} />
          <meshBasicMaterial color={hdr(color, 2.5)} toneMapped={false} />
        </mesh>
        {pins.map((p, i) => (
          <mesh key={i} position={p.p}>
            <boxGeometry args={p.r ? [0.2, 0.05, 0.08] : [0.08, 0.05, 0.2]} />
            <meshStandardMaterial color="#d8dcff" metalness={1} roughness={0.25} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

const KINDS = [Robotics, AI, Coding, Gaming, Innovation, Electronics];

export default function EventRing() {
  const zone = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Group>(null!);
  const light = useRef<THREE.PointLight>(null!);
  const holders = useRef<(THREE.Group | null)[]>([]);
  const spins = useRef(EVENTS.map(() => ({ current: null as THREE.Group | null })));
  const mats = useRef<MatLike[][]>([]);
  const lightColor = useMemo(() => new THREE.Color(), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useLayoutEffect(() => {
    mats.current = holders.current.map((h) => {
      const list: MatLike[] = [];
      h?.traverse((o) => {
        const m = (o as THREE.Mesh).material as MatLike | undefined;
        if (m && "emissiveIntensity" in m && (m as MatLike).isMeshStandardMaterial) {
          (m as MatLike).userData.base = (m as MatLike).emissiveIntensity;
          list.push(m);
        }
      });
      return list;
    });
  }, []);

  useFrame((st, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const s = state.sSmooth;
    zone.current.visible = s > 0.9 && s < 3.6;
    if (!zone.current.visible) return;
    const t = st.clock.elapsedTime * (env.reduced ? 0.2 : 1);
    const n = EVENTS.length;
    const active = state.activeEvent;
    // rotate the ring so the active object faces the camera
    const targetRot = -(active / n) * Math.PI * 2;
    // shortest-path interpolation
    let diff = targetRot - ring.current.rotation.y;
    diff = ((diff + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
    ring.current.rotation.y += diff * (1 - Math.exp(-3.2 * dt));

    holders.current.forEach((h, i) => {
      if (!h) return;
      const isActive = i === active;
      h.scale.setScalar(damp(h.scale.x, isActive ? 1.45 : 0.95, 5, dt));
      h.position.y = Math.sin(t * 0.8 + i * 1.3) * 0.25 + (isActive ? 0.3 : 0);
      const sp = spins.current[i].current;
      if (sp) {
        sp.rotation.y += dt * (isActive ? 1.4 : 0.5);
        if (i === 0) sp.rotation.y = 0, (sp.rotation.z += dt * (isActive ? 1.2 : 0.4));
        if (i === 4 || i === 2) sp.rotation.x += dt * 0.35;
      }
      (mats.current[i] || []).forEach((m) => {
        const base = (m.userData.base as number) ?? 0.5;
        m.emissiveIntensity = damp(m.emissiveIntensity, isActive ? base + 0.5 : base * 0.8, 5, dt);
      });
    });

    tmp.set(EVENTS[active].color);
    lightColor.lerp(tmp, 1 - Math.exp(-4 * dt));
    light.current.color.copy(lightColor);
  });

  return (
    <group ref={zone} position={[0, 0, -125]}>
      <pointLight ref={light} position={[0, 2, R * 0.55]} intensity={60} decay={1.6} distance={0} />
      <group ref={ring}>
        {EVENTS.map((e, i) => {
          const a = (i / EVENTS.length) * Math.PI * 2;
          const Kind = KINDS[i];
          return (
            <group key={e.id} position={[Math.sin(a) * R, 0, Math.cos(a) * R]} rotation-y={a}>
              <group ref={(el) => { holders.current[i] = el; }}>
                <Kind color={e.color} spin={spins.current[i] as React.RefObject<THREE.Group | null>} />
              </group>
              {/* pedestal */}
              <mesh position={[0, -2, 0]}>
                <cylinderGeometry args={[1, 1.15, 0.12, 40]} />
                <meshStandardMaterial color="#0a0f26" metalness={0.9} roughness={0.3} />
              </mesh>
              <mesh position={[0, -1.93, 0]} rotation-x={-Math.PI / 2}>
                <ringGeometry args={[0.95, 1, 64]} />
                <meshBasicMaterial color={hdr(e.color)} toneMapped={false} />
              </mesh>
              <mesh position={[0, 2.2, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 8.5, 6]} />
                <meshBasicMaterial color={e.color} transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
              </mesh>
            </group>
          );
        })}
        <mesh position={[0, -1.95, 0]} rotation-x={-Math.PI / 2}>
          <torusGeometry args={[R, 0.03, 8, 160]} />
          <meshBasicMaterial color={hdr("#2f6bff", 2.5)} toneMapped={false} />
        </mesh>
        <mesh position={[0, -1.95, 0]} rotation-x={-Math.PI / 2}>
          <torusGeometry args={[R + 1.6, 0.015, 8, 160]} />
          <meshBasicMaterial color={hdr("#8b5cf6", 2)} toneMapped={false} transparent opacity={0.7} />
        </mesh>
      </group>
      {/* central hologram */}
      <mesh>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshBasicMaterial color={hdr("#2f6bff", 1.6)} wireframe transparent opacity={0.3} toneMapped={false} />
      </mesh>
    </group>
  );
}
