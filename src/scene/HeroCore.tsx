import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { clamp, damp, env, state } from "../state";

const hdr = (c: string, k: number) => new THREE.Color(c).multiplyScalar(k);

/** The "Nexus Core": a reactive distorted-chrome heart with gyroscopic rings, shards and a shadow-casting pad. */
export default function HeroCore() {
  const zone = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Group>(null!);
  const sphere = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshPhysicalMaterial & { distort: number }>(null!);
  const shell = useRef<THREE.Mesh>(null!);
  const ringsG = useRef<THREE.Group>(null!);
  const r1 = useRef<THREE.Mesh>(null!);
  const r2 = useRef<THREE.Mesh>(null!);
  const r3 = useRef<THREE.Mesh>(null!);
  const shards = useRef<THREE.InstancedMesh>(null!);
  const light = useRef<THREE.PointLight>(null!);
  const shockwave = useRef<THREE.Mesh>(null!);
  const size = useThree((s) => s.size);
  const mobile = size.width < 768;

  const target = useMemo(() => new THREE.Object3D(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const cyan = useMemo(() => hdr("#35e0ff", 3), []);
  const violet = useMemo(() => hdr("#8b5cf6", 3), []);
  const shardData = useMemo(
    () =>
      Array.from({ length: env.low ? 18 : 40 }, () => ({
        r: 3.8 + Math.random() * 2.4,
        a: Math.random() * Math.PI * 2,
        y: (Math.random() - 0.5) * 3.4,
        sp: 0.12 + Math.random() * 0.3,
        s: 0.05 + Math.random() * 0.13,
        rot: Math.random() * 6,
      })),
    []
  );

  useLayoutEffect(() => {
    if (zone.current) {
      zone.current.position.set(mobile ? 0 : 2.5, mobile ? 1.5 : 0, 0);
      zone.current.scale.setScalar(mobile ? 0.72 : 1);
    }
  }, [mobile]);

  useFrame((st, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const s = state.sSmooth;
    const g = zone.current;
    g.visible = s < 1.5;
    if (!g.visible) return;

    const t = st.clock.elapsedTime * (env.reduced ? 0.25 : 1);
    state.pulse = Math.max(0, state.pulse - dt * 0.9);
    const p = state.pulse;
    const pe = p * p * (3 - 2 * p);

    const tx = mobile ? 0 : 2.5;
    const ty = mobile ? 1.5 : 0;
    g.position.x = damp(g.position.x, tx, 4, dt);
    g.position.y = damp(g.position.y, ty, 4, dt);

    // mouse-driven orientation + scroll-driven spin
    const sc = clamp(s, 0, 1.5);
    core.current.rotation.x = damp(core.current.rotation.x, -state.smy * 0.4, 3, dt);
    core.current.rotation.y = damp(core.current.rotation.y, state.smx * 0.7 + sc * Math.PI * 1.3, 3, dt);
    core.current.position.y = Math.sin(t * 0.9) * 0.18;

    sphere.current.rotation.y = t * 0.25;
    sphere.current.rotation.x = t * 0.12;
    sphere.current.scale.setScalar(1 + pe * 0.32 + Math.sin(t * 1.4) * 0.02);
    if (mat.current) {
      mat.current.emissiveIntensity = 0.35 + pe * 2.2 + Math.sin(t * 2) * 0.05;
      mat.current.distort = 0.36 + pe * 0.35 + Math.abs(state.vel) * 0.8;
    }
    shell.current.rotation.y = -t * 0.12;
    shell.current.rotation.z = t * 0.07;
    shell.current.scale.setScalar(1 + pe * 0.18 + sc * 0.25);

    // rings open up while you scroll away from the hero
    const open = 1 + clamp(s, 0, 1) * 1.15 + pe * 0.3;
    ringsG.current.scale.setScalar(open);
    r1.current.rotation.set(1.1 + Math.sin(t * 0.3) * 0.2, 0.2 + pe * 2.5, t * 0.6);
    r2.current.rotation.set(0.3, 1.2 + Math.cos(t * 0.25) * 0.2, -t * 0.45 + pe * 4);
    r3.current.rotation.set(Math.PI / 2 + Math.sin(t * 0.2) * 0.3, 0.1, t * 0.33);

    light.current.intensity = 14 + pe * 160;

    // shockwave on click
    const sw = shockwave.current;
    sw.visible = p > 0.01;
    const k = 1 - p;
    sw.scale.setScalar(1 + k * 9);
    (sw.material as THREE.MeshBasicMaterial).opacity = p * 0.7;

    // orbiting shards
    const im = shards.current;
    for (let i = 0; i < shardData.length; i++) {
      const d = shardData[i];
      const a = d.a + t * d.sp * (1 + pe * 3);
      dummy.position.set(Math.cos(a) * d.r * open * 0.8, d.y + Math.sin(t + d.rot) * 0.2, Math.sin(a) * d.r * open * 0.8);
      dummy.rotation.set(t * d.sp * 2 + d.rot, t * d.sp + d.rot, 0);
      dummy.scale.setScalar(d.s * (1 + pe));
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={zone}>
      <primitive object={target} />
      <spotLight
        position={[0, 9, 2.5]}
        angle={0.55}
        penumbra={1}
        intensity={260}
        color="#a9c3ff"
        castShadow={!env.low}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={4}
        shadow-camera-far={22}
        shadow-bias={-0.0004}
        target={target}
      />
      <pointLight ref={light} color="#35e0ff" intensity={14} distance={0} decay={2} />

      <group ref={core}>
        <mesh ref={sphere} castShadow>
          <icosahedronGeometry args={[1.35, env.low ? 24 : 48]} />
          <MeshDistortMaterial
            ref={mat as never}
            color="#0a1030"
            metalness={0.95}
            roughness={0.12}
            envMapIntensity={2.2}
            emissive="#1a3cff"
            emissiveIntensity={0.35}
            distort={0.38}
            speed={1.8}
          />
        </mesh>
        <mesh ref={shell}>
          <icosahedronGeometry args={[1.95, 2]} />
          <meshBasicMaterial color={cyan} wireframe transparent opacity={0.22} toneMapped={false} />
        </mesh>

        <group ref={ringsG}>
          <mesh ref={r1} castShadow>
            <torusGeometry args={[2.35, 0.035, 12, 160]} />
            <meshStandardMaterial color="#b8c8ff" metalness={1} roughness={0.22} emissive="#2f6bff" emissiveIntensity={0.6} />
            <mesh position={[2.35, 0, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshBasicMaterial color={cyan} toneMapped={false} />
            </mesh>
          </mesh>
          <mesh ref={r2} castShadow>
            <torusGeometry args={[2.85, 0.05, 12, 160]} />
            <meshStandardMaterial color="#c9b8ff" metalness={1} roughness={0.2} emissive="#8b5cf6" emissiveIntensity={0.6} />
            <mesh position={[2.85, 0, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color={violet} toneMapped={false} />
            </mesh>
          </mesh>
          <mesh ref={r3} castShadow>
            <torusGeometry args={[3.35, 0.03, 12, 160]} />
            <meshStandardMaterial color="#9fe9ff" metalness={1} roughness={0.25} emissive="#35e0ff" emissiveIntensity={0.5} />
            <mesh position={[3.35, 0, 0]}>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshBasicMaterial color={cyan} toneMapped={false} />
            </mesh>
          </mesh>
        </group>

        <instancedMesh ref={shards} args={[undefined, undefined, shardData.length]} frustumCulled={false}>
          <tetrahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#8fb0ff" metalness={1} roughness={0.2} emissive="#2f6bff" emissiveIntensity={0.8} flatShading />
        </instancedMesh>
      </group>

      <mesh ref={shockwave} rotation-x={-Math.PI / 2} position={[0, -3.25, 0]} visible={false}>
        <ringGeometry args={[0.9, 1, 96]} />
        <meshBasicMaterial color={cyan} transparent opacity={0} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* landing pad */}
      <group position={[0, -3.3, 0]}>
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <circleGeometry args={[5.6, 96]} />
          <meshStandardMaterial color="#070a1c" metalness={0.85} roughness={0.38} envMapIntensity={1.2} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
          <ringGeometry args={[5.45, 5.6, 128]} />
          <meshBasicMaterial color={cyan} toneMapped={false} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
          <ringGeometry args={[3.9, 3.94, 128]} />
          <meshBasicMaterial color={violet} toneMapped={false} transparent opacity={0.7} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
          <ringGeometry args={[2.2, 2.23, 128]} />
          <meshBasicMaterial color={cyan} toneMapped={false} transparent opacity={0.5} />
        </mesh>
      </group>

      <Sparkles count={env.low ? 30 : 70} scale={[9, 6, 9]} size={2.4} speed={0.4} color="#6fd8ff" opacity={0.8} />
    </group>
  );
}
