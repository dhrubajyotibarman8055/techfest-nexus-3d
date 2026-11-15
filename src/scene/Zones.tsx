import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";
import { env, state } from "../state";

const hdr = (c: string, k = 3) => new THREE.Color(c).multiplyScalar(k);

/* ------------------------------------------------------------------ */
/* Shard field (workshops)                                             */
/* ------------------------------------------------------------------ */
export function ShardField() {
  const group = useRef<THREE.Group>(null!);
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const count = env.low ? 50 : 110;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => {
        let x = (Math.random() - 0.5) * 56;
        // keep a loose corridor near the camera path clear
        if (Math.abs(x) < 3) x += x < 0 ? -4 : 4;
        return {
          x,
          y: (Math.random() - 0.5) * 28,
          z: -148 - Math.random() * 42,
          s: 0.3 + Math.random() * 1.3,
          rx: (Math.random() - 0.5) * 0.8,
          ry: (Math.random() - 0.5) * 0.8,
          o: Math.random() * 6,
        };
      }),
    [count]
  );

  useLayoutEffect(() => {
    const pal = ["#2f6bff", "#8b5cf6", "#35e0ff", "#5b7bff"].map((c) => new THREE.Color(c));
    data.forEach((_, i) => mesh.current.setColorAt(i, pal[i % pal.length]));
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [data]);

  useFrame((st) => {
    const s = state.sSmooth;
    group.current.visible = s > 2.3 && s < 4.7;
    if (!group.current.visible) return;
    const t = st.clock.elapsedTime * (env.reduced ? 0.2 : 1);
    for (let i = 0; i < count; i++) {
      const d = data[i];
      dummy.position.set(d.x, d.y + Math.sin(t * 0.5 + d.o) * 0.6, d.z);
      dummy.rotation.set(t * d.rx + d.o, t * d.ry, 0);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#9bb5ff" metalness={1} roughness={0.22} emissive="#1a2a8f" emissiveIntensity={0.7} flatShading envMapIntensity={1.5} />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Hex time tunnel (schedule)                                          */
/* ------------------------------------------------------------------ */
export function Tunnel() {
  const group = useRef<THREE.Group>(null!);
  const rings = useRef<THREE.InstancedMesh>(null!);
  const packets = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const COUNT = env.low ? 22 : 32;
  const SPACING = 2.3;
  const Z0 = -194;
  const PCOUNT = env.low ? 24 : 56;
  const pdata = useMemo(
    () =>
      Array.from({ length: PCOUNT }, () => ({
        a: Math.random() * Math.PI * 2,
        r: 3.2 + Math.random() * 1.8,
        z: Z0 - Math.random() * COUNT * SPACING,
        sp: 6 + Math.random() * 14,
      })),
    [PCOUNT, COUNT]
  );

  useLayoutEffect(() => {
    const a = new THREE.Color("#35e0ff");
    const b = new THREE.Color("#2f6bff");
    const c = new THREE.Color("#8b5cf6");
    for (let i = 0; i < COUNT; i++) {
      const k = i / (COUNT - 1);
      const col = k < 0.5 ? a.clone().lerp(b, k * 2) : b.clone().lerp(c, (k - 0.5) * 2);
      rings.current.setColorAt(i, col.multiplyScalar(2.6));
    }
    if (rings.current.instanceColor) rings.current.instanceColor.needsUpdate = true;
    for (let i = 0; i < PCOUNT; i++) packets.current.setColorAt(i, hdr(i % 3 ? "#35e0ff" : "#ffffff", 3));
    if (packets.current.instanceColor) packets.current.instanceColor.needsUpdate = true;
  }, [COUNT, PCOUNT]);

  useFrame((st) => {
    const s = state.sSmooth;
    group.current.visible = s > 3.4 && s < 5.7;
    if (!group.current.visible) return;
    const t = st.clock.elapsedTime * (env.reduced ? 0.2 : 1);
    for (let i = 0; i < COUNT; i++) {
      dummy.position.set(0, 0, Z0 - i * SPACING);
      dummy.rotation.set(0, 0, i * 0.14 + t * 0.15 * (i % 2 ? 1 : -1));
      const wave = 1 + 0.07 * Math.sin(t * 2.5 - i * 0.55);
      dummy.scale.set(wave, wave, 1);
      dummy.updateMatrix();
      rings.current.setMatrixAt(i, dummy.matrix);
    }
    rings.current.instanceMatrix.needsUpdate = true;

    const len = COUNT * SPACING;
    for (let i = 0; i < PCOUNT; i++) {
      const d = pdata[i];
      d.z += d.sp * 0.016 * (env.reduced ? 0.2 : 1);
      if (d.z > Z0 + 6) d.z = Z0 - len;
      const a = d.a + t * 0.3;
      dummy.position.set(Math.cos(a) * d.r, Math.sin(a) * d.r, d.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(0.05, 0.05, 0.9);
      dummy.updateMatrix();
      packets.current.setMatrixAt(i, dummy.matrix);
    }
    packets.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={rings} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <torusGeometry args={[5.6, 0.05, 6, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={packets} args={[undefined, undefined, PCOUNT]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Monolith gate (sponsors)                                            */
/* ------------------------------------------------------------------ */
const MONOLITHS: [number, number, number, number][] = [
  [-8, 1.5, -284, 5],
  [7.5, -1, -288, 6],
  [-5, -3.5, -298, 4],
  [6, 4, -301, 5],
  [-11, 5, -306, 6],
  [11, -4, -308, 5],
];

export function Monoliths() {
  const group = useRef<THREE.Group>(null!);
  const items = useRef<(THREE.Mesh | null)[]>([]);
  const edge = useMemo(() => hdr("#35e0ff", 2.2), []);

  useFrame((st) => {
    const s = state.sSmooth;
    group.current.visible = s > 4.4 && s < 6.7;
    if (!group.current.visible) return;
    const t = st.clock.elapsedTime * (env.reduced ? 0.2 : 1);
    items.current.forEach((m, i) => {
      if (!m) return;
      m.position.y = MONOLITHS[i][1] + Math.sin(t * 0.5 + i * 2) * 0.5;
      m.rotation.y = t * 0.15 * (i % 2 ? 1 : -1) + i;
    });
  });

  return (
    <group ref={group}>
      {MONOLITHS.map(([x, y, z, h], i) => (
        <mesh key={i} ref={(el) => { items.current[i] = el; }} position={[x, y, z]}>
          <boxGeometry args={[1.6, h, 0.35]} />
          <meshPhysicalMaterial color="#070b22" metalness={0.9} roughness={0.14} clearcoat={1} clearcoatRoughness={0.1} envMapIntensity={1.6} />
          <Edges color={i % 2 ? edge : hdr("#8b5cf6", 2.2)} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Portal (finale)                                                     */
/* ------------------------------------------------------------------ */
const portalFrag = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
void main(){
  vec2 p = vUv - 0.5;
  float r = length(p) * 2.0;
  float a = atan(p.y, p.x);
  float swirl = sin(a * 6.0 + r * 12.0 - uTime * 2.2) * 0.5 + 0.5;
  float rings = sin(r * 34.0 - uTime * 3.2) * 0.5 + 0.5;
  vec3 c = mix(vec3(0.08,0.25,1.0), vec3(0.65,0.2,1.0), swirl);
  c += vec3(0.0,0.8,1.0) * rings * 0.35 * (1.0 - r);
  float alpha = smoothstep(1.0, 0.15, r) * (0.35 + 0.5 * swirl);
  gl_FragColor = vec4(c * (1.6 - r), alpha);
}`;

export function Portal() {
  const group = useRef<THREE.Group>(null!);
  const rings = useRef<THREE.Group>(null!);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: portalFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 } },
      }),
    []
  );
  const radii = [3.2, 4.4, 5.8, 7.4];

  useFrame((st) => {
    const s = state.sSmooth;
    group.current.visible = s > 5.0;
    if (!group.current.visible) return;
    const t = st.clock.elapsedTime * (env.reduced ? 0.2 : 1);
    mat.uniforms.uTime.value = t;
    const boost = 1 + Math.max(0, s - 5.5) * 0.8;
    rings.current.children.forEach((c, i) => {
      c.rotation.z = t * (0.25 + i * 0.12) * (i % 2 ? -1 : 1) * boost;
      c.rotation.x = Math.sin(t * 0.4 + i) * 0.18;
      c.rotation.y = Math.cos(t * 0.35 + i) * 0.18;
    });
  });

  return (
    <group ref={group} position={[0, 0, -335]}>
      <mesh>
        <circleGeometry args={[3, 64]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <group ref={rings}>
        {radii.map((r, i) => (
          <mesh key={r}>
            <torusGeometry args={[r, 0.07 + i * 0.015, 12, i === 3 ? 6 : 128]} />
            <meshBasicMaterial color={hdr(i % 2 ? "#8b5cf6" : "#35e0ff", 2.8)} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <pointLight color="#8b5cf6" intensity={90} decay={1.4} position={[0, 0, 4]} />
    </group>
  );
}
