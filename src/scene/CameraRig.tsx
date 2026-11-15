import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { clamp, computeS, damp, env, state } from "../state";

// One keyframe per section (+1 closing keyframe). The camera glides along a spline through them.
const KEYS: { p: [number, number, number]; t: [number, number, number] }[] = [
  { p: [0, 0.6, 9], t: [0, 0, 0] }, // hero
  { p: [-16, 7, -20], t: [3, -4, -52] }, // about — over the city
  { p: [0, 0.8, -104], t: [0, -2.6, -125] }, // events — arena ring
  { p: [9, 3, -140], t: [0, -1, -162] }, // workshops — shard field
  { p: [0, 0, -188], t: [0, 0, -212] }, // schedule — tunnel
  { p: [0, 0, -268], t: [0, 0, -292] }, // sponsors — monolith gate
  { p: [0, 0.5, -308], t: [0, 0, -335] }, // contact — portal
  { p: [0, 0.2, -319], t: [0, 0, -340] }, // closing push
];

export default function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const { posCurve, tgtCurve, p, t } = useMemo(
    () => ({
      posCurve: new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k.p)), false, "centripetal"),
      tgtCurve: new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k.t)), false, "centripetal"),
      p: new THREE.Vector3(),
      t: new THREE.Vector3(),
    }),
    []
  );

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const s = computeS();
    state.s = s;
    if (!state.inited) {
      state.sSmooth = s;
      state.inited = true;
    }
    state.sSmooth = damp(state.sSmooth, s, 4.2, dt);
    state.smx = damp(state.smx, state.mx, 2.6, dt);
    state.smy = damp(state.smy, state.my, 2.6, dt);

    const u = clamp(state.sSmooth / (KEYS.length - 1), 0, 1);
    posCurve.getPoint(u, p);
    tgtCurve.getPoint(u, t);

    const k = env.low ? 0.35 : 1;
    p.x += state.smx * 1.2 * k;
    p.y += state.smy * 0.7 * k;
    t.x += state.smx * 0.4 * k;
    t.y += state.smy * 0.25 * k;

    camera.position.copy(p);
    camera.lookAt(t);

    const v = s - state.sSmooth;
    state.vel = v;
    if (!env.reduced) {
      camera.rotateZ(clamp(-v * 0.05, -0.07, 0.07));
      const fov = 50 + clamp(Math.abs(v) * 9, 0, 9);
      if (Math.abs(fov - camera.fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
}
