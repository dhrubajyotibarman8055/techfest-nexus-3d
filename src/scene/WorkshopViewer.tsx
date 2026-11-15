import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { damp, env } from "../state";

const hdr = (c: string, k = 3) => new THREE.Color(c).multiplyScalar(k);

function Shape({ index, color }: { index: number; color: string }) {
  const g = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1.5, 0)), []);

  useFrame((st, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = st.clock.elapsedTime;
    g.current.scale.setScalar(damp(g.current.scale.x, 1, 5, dt));
    g.current.rotation.y += dt * 0.25;
    if (index === 2 && inner.current) inner.current.rotation.y -= dt * 1.2;
    if (index === 3 && inner.current) {
      inner.current.children.forEach((c, i) => {
        const k = 1 + 0.1 * Math.sin(t * 2.2 - i * 0.7);
        c.scale.set(k, k, k);
      });
    }
  });

  const metal = <meshStandardMaterial color="#10162f" metalness={1} roughness={0.16} emissive={color} emissiveIntensity={0.45} envMapIntensity={1.7} />;

  return (
    <group ref={g} scale={0.001} position-y={-0.1}>
      {index === 0 && (
        <>
          <mesh>
            <torusKnotGeometry args={[1, 0.34, 220, 24]} />
            {metal}
          </mesh>
          <mesh>
            <torusKnotGeometry args={[1, 0.38, 100, 8]} />
            <meshBasicMaterial color={hdr(color, 1.4)} wireframe transparent opacity={0.08} toneMapped={false} />
          </mesh>
        </>
      )}
      {index === 1 && (
        <>
          <mesh>
            <octahedronGeometry args={[1.45, 0]} />
            <meshPhysicalMaterial color="#0b1030" metalness={0.8} roughness={0.1} clearcoat={1} emissive={color} emissiveIntensity={0.25} envMapIntensity={1.6} />
          </mesh>
          <lineSegments geometry={edges}>
            <lineBasicMaterial color={hdr(color, 3)} toneMapped={false} />
          </lineSegments>
          <mesh rotation-x={Math.PI / 2}>
            <torusGeometry args={[2.1, 0.03, 8, 96]} />
            <meshBasicMaterial color={hdr(color, 3)} toneMapped={false} />
          </mesh>
        </>
      )}
      {index === 2 && (
        <>
          <mesh>
            <icosahedronGeometry args={[0.9, 1]} />
            {metal}
          </mesh>
          <group ref={inner}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(a) * 1.9, Math.sin(a * 2) * 0.4, Math.sin(a) * 1.9]} rotation={[a, a, 0]}>
                  <boxGeometry args={[0.45, 0.45, 0.45]} />
                  {metal}
                </mesh>
              );
            })}
          </group>
        </>
      )}
      {index === 3 && (
        <group ref={inner} rotation-x={Math.PI / 2.4}>
          {[0.7, 1.1, 1.5, 1.9, 2.3].map((r, i) => (
            <mesh key={r}>
              <torusGeometry args={[r, 0.045 + i * 0.006, 12, 120]} />
              <meshBasicMaterial color={hdr(color, 3 - i * 0.35)} toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}
      {index === 4 && (
        <>
          <mesh>
            <dodecahedronGeometry args={[1.5, 0]} />
            <meshPhysicalMaterial color="#9fb6ff" transmission={0.95} thickness={1} roughness={0.05} ior={1.45} metalness={0} envMapIntensity={2} attenuationColor={color} attenuationDistance={2.5} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.7, 1]} />
            <meshBasicMaterial color={hdr(color, 2.5)} wireframe toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
}

export default function WorkshopViewer({ index, color }: { index: number; color: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="h-full w-full" role="img" aria-label="Interactive 3D model representing the selected experience">
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.6]}
        camera={{ position: [0, 0, 8], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        style={{ touchAction: "pan-y" }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 4]} intensity={40} color={color} />
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={4} color="#35e0ff" position={[-4, 2, 2]} scale={[6, 1, 1]} rotation-y={Math.PI / 2.5} />
          <Lightformer form="rect" intensity={3} color="#8b5cf6" position={[4, 0, 2]} scale={[6, 1, 1]} rotation-y={-Math.PI / 2.5} />
          <Lightformer form="ring" intensity={3} color="#ffffff" position={[0, 2, 5]} scale={3} />
        </Environment>
        <Shape key={index} index={index} color={color} />
        <Sparkles count={env.low ? 25 : 50} scale={[7, 6, 7]} size={2.5} speed={0.4} color={color} />
        {env.fine && <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.8} />}
      </Canvas>
    </div>
  );
}
