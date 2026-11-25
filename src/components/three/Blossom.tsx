"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { beginNormalGLSL, displaceGLSL, noiseGLSL } from "./shaders";

const GLASS = {
  color: "#d8d0ff",
  iridescence: 1,
  iridescenceIOR: 1.6,
  iridescenceThicknessRange: [120, 680] as [number, number],
  transmission: 0.65,
  roughness: 0.12,
  metalness: 0.05,
  thickness: 1.4,
  ior: 1.45,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
  envMapIntensity: 1.1,
  attenuationColor: "#c9b8ff",
  attenuationDistance: 2.4,
};

/** Deterministic pseudo-random so renders stay pure. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function Blossom() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const shards = useRef<THREE.Group>(null);
  const uniforms = useRef({
    uTime: { value: 0 },
    uPress: { value: 0 },
    uScroll: { value: 0 },
    uPressDir: { value: new THREE.Vector3(0, 0, 1) },
  });
  const scratch = useRef({
    ray: new THREE.Ray(),
    sphere: new THREE.Sphere(new THREE.Vector3(), 1.35),
    hit: new THREE.Vector3(),
    ndc: new THREE.Vector3(),
    cam: new THREE.Vector3(),
  });
  const isMobile = useThree((s) => s.size.width < 768);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  // Vertical FOV: narrow portrait screens need a smaller form to fit the width.
  const fit = 0.88 * Math.max(0.45, Math.min(1, aspect / 0.85));

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, isMobile ? 40 : 72), [isMobile]);

  const shardData = useMemo(() => {
    const rand = seeded(7);
    return Array.from({ length: 16 }, (_, i) => {
      const radius = 2.1 + rand() * 1.4;
      const theta = (i / 16) * Math.PI * 2 + rand() * 0.4;
      return {
        position: [Math.cos(theta) * radius, (rand() - 0.5) * 2.4, Math.sin(theta) * radius] as [number, number, number],
        scale: 0.05 + rand() * 0.11,
        speed: 0.2 + rand() * 0.5,
        rotation: [rand() * Math.PI, rand() * Math.PI, 0] as [number, number, number],
      };
    });
  }, []);

  const onBeforeCompile = (shader: THREE.WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms.current);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${noiseGLSL}\n${displaceGLSL}`)
      .replace("#include <beginnormal_vertex>", beginNormalGLSL)
      .replace("#include <begin_vertex>", "vec3 transformed = bPos;");
  };

  useFrame((state, delta) => {
    const u = uniforms.current;
    const reduced = sceneState.reducedMotion;
    const dt = Math.min(delta, 0.05);

    if (!reduced) u.uTime.value += dt;
    u.uScroll.value = THREE.MathUtils.damp(u.uScroll.value, sceneState.page, 3, dt);

    // Aim the press ripple where the pointer meets the glass.
    if (sceneState.pressAt && group.current) {
      const { ray, sphere, hit, ndc, cam } = scratch.current;
      ndc.set(sceneState.pressAt.x, sceneState.pressAt.y, 0.5).unproject(state.camera);
      ray.origin.copy(state.camera.position);
      ray.direction.copy(ndc).sub(state.camera.position).normalize();
      if (ray.intersectSphere(sphere, hit)) {
        u.uPressDir.value.copy(group.current.worldToLocal(hit).normalize());
      } else {
        u.uPressDir.value.copy(group.current.worldToLocal(cam.copy(state.camera.position)).normalize());
      }
      sceneState.pressAt = null;
    }
    sceneState.press = THREE.MathUtils.damp(sceneState.press, 0, 1.6, dt);
    u.uPress.value = sceneState.press;

    if (group.current) {
      const g = group.current;
      const { x: px, y: py } = sceneState.pointer;
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, (reduced ? 0 : u.uTime.value * 0.08) + px * 0.35, 2.5, dt);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -py * 0.25 + sceneState.page * 0.6, 2.5, dt);
      const breathe = reduced ? 1 : 1 + Math.sin(u.uTime.value * 0.6) * 0.015;
      g.scale.setScalar(breathe * fit);
    }
    if (reduced) return;
    if (core.current) {
      core.current.rotation.x += dt * 0.2;
      core.current.rotation.z += dt * 0.13;
    }
    if (shards.current) {
      shards.current.rotation.y += dt * 0.05;
      shards.current.children.forEach((child, i) => {
        child.rotation.x += dt * shardData[i].speed;
        child.rotation.y += dt * shardData[i].speed * 0.7;
      });
    }
  });

  return (
    <group>
      <group ref={group}>
        <mesh geometry={geometry} frustumCulled={false}>
          <meshPhysicalMaterial
            {...GLASS}
            onBeforeCompile={onBeforeCompile}
            customProgramCacheKey={() => "lilg-blossom"}
          />
        </mesh>
        <mesh ref={core} scale={0.42}>
          <icosahedronGeometry args={[1, 1]} />
          <meshPhysicalMaterial
            color="#ffb347"
            emissive="#ff8a3d"
            emissiveIntensity={0.55}
            roughness={0.25}
            metalness={0.2}
            iridescence={1}
            iridescenceIOR={1.6}
            flatShading
          />
        </mesh>
      </group>
      <group ref={shards}>
        {shardData.map((s, i) => (
          <mesh key={i} position={s.position} rotation={s.rotation} scale={s.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial {...GLASS} transmission={0.4} thickness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
