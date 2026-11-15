import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";
import { FOG, env, state } from "../state";

const vertex = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vId;
void main(){
  mat4 m = modelMatrix * instanceMatrix;
  vec4 wp = m * vec4(position, 1.0);
  vWorld = wp.xyz;
  vNormal = normalize(mat3(m) * normal);
  vId = vec2(instanceMatrix[3].x, instanceMatrix[3].z);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const fragment = /* glsl */ `
uniform float uTime;
uniform vec3 uFog;
uniform float uNear;
uniform float uFar;
uniform float uBaseY;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vId;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
void main(){
  vec3 n = normalize(vNormal);
  float side = 1.0 - step(0.5, abs(n.y));
  float u = abs(n.x) > 0.5 ? vWorld.z : vWorld.x;
  vec2 g = vec2(u * 1.25, vWorld.y * 0.95);
  vec2 cell = floor(g);
  vec2 f = fract(g);
  float win = step(0.2, f.x) * step(f.x, 0.8) * step(0.28, f.y) * step(f.y, 0.72);
  float r = hash(cell + vId * 1.37);
  float on = step(0.6, r);
  float flick = 0.65 + 0.35 * sin(uTime * (0.4 + r * 2.0) + r * 40.0);
  vec3 wc = mix(vec3(0.15,0.75,1.0), vec3(0.65,0.3,1.0), step(0.5, hash(cell.yx + vId)));
  wc = mix(wc, vec3(1.0,0.85,0.6), step(0.94, r));

  float h = max(vWorld.y - uBaseY, 0.0);
  vec3 base = vec3(0.035, 0.05, 0.12) * (0.55 + 0.6 * max(dot(n, normalize(vec3(0.4, 0.8, 0.3))), 0.0));
  base += vec3(0.05, 0.2, 0.55) * exp(-h * 0.35) * 0.6;
  vec3 col = base + wc * win * on * flick * side * 2.4;
  // roof rim
  col += vec3(0.2, 0.6, 1.0) * step(0.5, n.y) * 0.35;
  // subtle floor-line banding
  col += vec3(0.1,0.25,0.6) * side * smoothstep(0.92, 1.0, f.y) * 0.25;

  float d = length(vWorld - cameraPosition);
  col = mix(col, uFog, smoothstep(uNear, uFar, d));
  gl_FragColor = vec4(col, 1.0);
}`;

const BASE_Y = -11;

export default function City() {
  const group = useRef<THREE.Group>(null!);
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const cars = useRef<THREE.InstancedMesh>(null!);
  const towerRings = useRef<THREE.Group>(null!);
  const N = env.low ? 9 : 12;
  const SP = 2.8;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const buildings = useMemo(() => {
    const arr: { x: number; z: number; w: number; d: number; h: number }[] = [];
    for (let gx = -N; gx <= N; gx++) {
      for (let gz = -N; gz <= N; gz++) {
        if (gx % 3 === 0 || gz % 3 === 0) continue;
        const dist = Math.hypot(gx, gz) / N;
        const h = (1.2 + Math.pow(Math.random(), 1.7) * 9.5) * (1.3 - dist * 0.75);
        arr.push({
          x: gx * SP + (Math.random() - 0.5) * 0.3,
          z: gz * SP + (Math.random() - 0.5) * 0.3,
          w: 1.3 + Math.random() * 0.9,
          d: 1.3 + Math.random() * 0.9,
          h: Math.max(1, h),
        });
      }
    }
    return arr;
  }, [N]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uTime: { value: 0 },
          uFog: { value: new THREE.Color(FOG.color) },
          uNear: { value: FOG.near },
          uFar: { value: FOG.far },
          uBaseY: { value: BASE_Y },
        },
      }),
    []
  );

  const carData = useMemo(() => {
    const lanes: number[] = [];
    for (let k = -N; k <= N; k += 3) lanes.push(k * SP);
    const colors = [new THREE.Color("#35e0ff"), new THREE.Color("#8b5cf6"), new THREE.Color("#ff8a3d"), new THREE.Color("#ffffff")];
    return Array.from({ length: env.low ? 36 : 80 }, () => ({
      axis: Math.random() > 0.5 ? 0 : 1,
      lane: lanes[Math.floor(Math.random() * lanes.length)],
      y: 0.8 + Math.random() * 12,
      pos: (Math.random() - 0.5) * (N * SP * 2 + 16),
      speed: (3 + Math.random() * 7) * (Math.random() > 0.5 ? 1 : -1),
      color: colors[Math.floor(Math.random() * colors.length)].clone().multiplyScalar(3),
    }));
  }, [N]);

  const beams = useMemo(
    () => [
      [-16, 5], [14, -8], [-7, -18], [10, 14], [-22, -6], [20, 3],
    ] as [number, number][],
    []
  );

  useLayoutEffect(() => {
    buildings.forEach((b, i) => {
      dummy.position.set(b.x, 0, b.z);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    carData.forEach((c, i) => cars.current.setColorAt(i, c.color));
    if (cars.current.instanceColor) cars.current.instanceColor.needsUpdate = true;
  }, [buildings, carData, dummy]);

  useFrame((st, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const s = state.sSmooth;
    group.current.visible = s > 0.15 && s < 3.3;
    if (!group.current.visible) return;
    const t = st.clock.elapsedTime * (env.reduced ? 0.2 : 1);
    material.uniforms.uTime.value = t;

    const ext = N * SP + 8;
    for (let i = 0; i < carData.length; i++) {
      const c = carData[i];
      c.pos += c.speed * dt * (env.reduced ? 0.2 : 1);
      if (c.pos > ext) c.pos = -ext;
      if (c.pos < -ext) c.pos = ext;
      if (c.axis === 0) {
        dummy.position.set(c.pos, c.y, c.lane + 0.35);
        dummy.scale.set(1.6, 0.07, 0.07);
      } else {
        dummy.position.set(c.lane + 0.35, c.y, c.pos);
        dummy.scale.set(0.07, 0.07, 1.6);
      }
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      cars.current.setMatrixAt(i, dummy.matrix);
    }
    cars.current.instanceMatrix.needsUpdate = true;

    towerRings.current.children.forEach((c, i) => {
      c.rotation.y = t * (0.4 + i * 0.25) * (i % 2 ? -1 : 1);
      c.rotation.x = Math.sin(t * 0.5 + i) * 0.25;
    });
  });

  return (
    <group ref={group} position={[0, BASE_Y, -50]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, buildings.length]} material={material} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} onUpdate={(g) => g.translate(0, 0.5, 0)} />
      </instancedMesh>

      <instancedMesh ref={cars} args={[undefined, undefined, carData.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      <Grid
        position={[0, 0.02, 0]}
        args={[200, 200]}
        cellSize={1.4}
        cellThickness={0.6}
        cellColor="#14306e"
        sectionSize={8.4}
        sectionThickness={1.2}
        sectionColor="#2f6bff"
        fadeDistance={95}
        fadeStrength={1.6}
        infiniteGrid
      />

      {/* landmark tower */}
      <group>
        <mesh position={[0, 16, 0]}>
          <cylinderGeometry args={[0.35, 0.9, 32, 8]} />
          <meshStandardMaterial color="#0b1230" metalness={1} roughness={0.2} emissive="#2f6bff" emissiveIntensity={0.7} />
        </mesh>
        <group ref={towerRings} position={[0, 20, 0]}>
          {[3.4, 4.8, 6.4].map((r, i) => (
            <mesh key={r} position={[0, -6 + i * 5, 0]}>
              <torusGeometry args={[r, 0.06, 8, 96]} />
              <meshBasicMaterial color={new THREE.Color(i === 1 ? "#8b5cf6" : "#35e0ff").multiplyScalar(3)} toneMapped={false} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 60, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 120, 8]} />
          <meshBasicMaterial color="#35e0ff" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>

      {/* light pillars */}
      {beams.map(([x, z], i) => (
        <mesh key={i} position={[x, 20, z]}>
          <cylinderGeometry args={[0.12, 0.12, 40, 6]} />
          <meshBasicMaterial
            color={i % 2 ? "#8b5cf6" : "#2f6bff"}
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
