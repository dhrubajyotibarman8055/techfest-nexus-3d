import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import CameraRig from "./CameraRig";
import Particles from "./Particles";
import HeroCore from "./HeroCore";
import City from "./City";
import EventRing from "./EventRing";
import { Monoliths, Portal, ShardField, Tunnel } from "./Zones";
import { FOG, clamp, env, state } from "../state";

/** Two point lights that travel with the camera so every zone gets cinematic rim lighting. */
function LightRig() {
  const a = useRef<THREE.PointLight>(null!);
  const b = useRef<THREE.PointLight>(null!);
  const camera = useThree((s) => s.camera);
  useFrame(() => {
    a.current.position.set(camera.position.x + 3, camera.position.y + 3, camera.position.z + 2);
    b.current.position.set(camera.position.x - 4, camera.position.y - 2, camera.position.z - 3);
  });
  return (
    <>
      <pointLight ref={a} color="#4fa8ff" intensity={20} decay={1} />
      <pointLight ref={b} color="#9a6bff" intensity={16} decay={1} />
    </>
  );
}

function Effects({ degraded }: { degraded: boolean }) {
  const ca = useRef<{ offset: THREE.Vector2 } | null>(null);
  useFrame(() => {
    if (ca.current) {
      const o = clamp(Math.abs(state.vel) * 0.012, 0, 0.006) + 0.0004;
      ca.current.offset.set(o, o);
    }
  });
  const showCA = !degraded && !env.low && !env.reduced;
  return (
    <EffectComposer multisampling={env.low ? 0 : 4} enableNormalPass={false}>
      <Bloom intensity={env.low ? 0.75 : 1} luminanceThreshold={0.6} luminanceSmoothing={0.25} mipmapBlur radius={0.7} />
      {showCA ? <ChromaticAberration ref={ca as never} offset={new THREE.Vector2(0.0004, 0.0004)} radialModulation={false} modulationOffset={0} /> : <></>}
      <Vignette eskil={false} offset={0.25} darkness={0.85} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

export default function Scene() {
  const [dpr, setDpr] = useState(env.low ? 1.25 : 1.75);
  const [degraded, setDegraded] = useState(false);

  return (
    <Canvas
      shadows={!env.low}
      dpr={dpr}
      camera={{ fov: 50, near: 0.1, far: 420, position: [0, 0.6, 9] }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      onCreated={() => {
        // allow first frames to compile shaders before the loader dismisses
        setTimeout(() => (state.sceneReady = true), 500);
      }}
    >
      <color attach="background" args={[FOG.color]} />
      <fog attach="fog" args={[FOG.color, FOG.near, FOG.far]} />
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setDegraded(true);
        }}
      />

      <ambientLight intensity={0.22} />
      <LightRig />

      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={5} color="#35e0ff" position={[-6, 3, -4]} scale={[10, 1.2, 1]} rotation-y={Math.PI / 2} />
          <Lightformer form="rect" intensity={4} color="#8b5cf6" position={[6, 1, -3]} scale={[10, 1.5, 1]} rotation-y={-Math.PI / 2} />
          <Lightformer form="rect" intensity={3} color="#2f6bff" position={[0, 6, 2]} scale={[12, 3, 1]} rotation-x={Math.PI / 2} />
          <Lightformer form="ring" intensity={4} color="#ffffff" position={[0, 1, 7]} scale={4} />
          <Lightformer form="rect" intensity={2} color="#ff8a3d" position={[0, -4, 3]} scale={[8, 1, 1]} rotation-x={-Math.PI / 2} />
        </Environment>

        <CameraRig />
        <Particles />
        <HeroCore />
        <City />
        <EventRing />
        <ShardField />
        <Tunnel />
        <Monoliths />
        <Portal />
      </Suspense>

      <Effects degraded={degraded} />
    </Canvas>
  );
}
