import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { env } from "../state";

const vertex = /* glsl */ `
uniform float uTime;
uniform float uScale;
attribute float aSize;
attribute float aSeed;
varying float vA;
varying float vSeed;
void main(){
  vec3 p = position;
  p.x += sin(uTime*0.3 + aSeed*6.283)*0.7;
  p.y += cos(uTime*0.25 + aSeed*12.0)*0.7;
  p.z += sin(uTime*0.2 + aSeed*20.0)*0.5;
  vec4 mv = modelViewMatrix * vec4(p,1.0);
  gl_PointSize = min(aSize * uScale * (34.0 / -mv.z), 42.0);
  gl_Position = projectionMatrix * mv;
  vA = smoothstep(130.0, 25.0, -mv.z) * smoothstep(0.0, 5.0, -mv.z);
  vSeed = aSeed;
}`;

const fragment = /* glsl */ `
varying float vA;
varying float vSeed;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  vec3 c = mix(vec3(0.25,0.75,1.0), vec3(0.62,0.38,1.0), vSeed);
  gl_FragColor = vec4(c * 1.7, a * vA * 0.9);
}`;

export default function Particles() {
  const count = env.low ? 900 : 2600;
  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 44;
      pos[i * 3 + 2] = 20 - Math.random() * 380;
      size[i] = 0.5 + Math.random() * 1.6;
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uScale: { value: 1 } },
    });
    return { geometry: g, material: m };
  }, [count]);

  useFrame((st) => {
    material.uniforms.uTime.value = st.clock.elapsedTime * (env.reduced ? 0.2 : 1);
    material.uniforms.uScale.value = st.size.height / 900;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
