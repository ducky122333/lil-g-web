"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";
import { sceneState } from "@/lib/sceneState";

/** Height of the trumpet rim in flower-local units. The nectar sits just below. */
export const FLOWER_RIM_Y = 0.9;
const RIM_RADIUS = 0.3;
const PETALS = 5;

const FROSTED_GLASS = {
  color: "#f7e2dc",
  transmission: 0.85,
  roughness: 0.15,
  thickness: 0.5,
  ior: 1.45,
  iridescence: 0.35,
  iridescenceIOR: 1.3,
  attenuationColor: "#ffd6c4",
  attenuationDistance: 1.6,
  clearcoat: 0.6,
  clearcoatRoughness: 0.12,
  envMapIntensity: 1.2,
  side: THREE.DoubleSide,
};

/** Trumpet throat: a lathe profile that flares from a slim base to the rim. */
function useThroat() {
  return useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const steps = 32;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const r = 0.045 + (RIM_RADIUS - 0.045) * Math.pow(t, 2.3);
      pts.push(new THREE.Vector2(r, t * FLOWER_RIM_Y));
    }
    return new THREE.LatheGeometry(pts, 96);
  }, []);
}

/**
 * One petal as a parametric surface: rooted on the rim, it widens, then tapers
 * to a fine tip while arching outward and drooping, with gently cupped edges.
 */
function usePetal() {
  return useMemo(() => {
    const halfArc = (Math.PI * RIM_RADIUS) / PETALS;
    return new ParametricGeometry(
      (u, v, target) => {
        const t = u;
        const s = v * 2 - 1;
        const width = (halfArc * 1.05 + 0.09 * Math.sin(Math.PI * t)) * (1 - Math.pow(t, 2.6));
        const r = RIM_RADIUS + 0.62 * t;
        const h = FLOWER_RIM_Y + 0.34 * t - 0.36 * t * t;
        const cup = 0.07 * s * s * (1 - 0.4 * t);
        // Local frame: x = radial, z = tangential, y = up.
        target.set(r - cup * 0.3, h + cup, s * width);
      },
      40,
      16,
    );
  }, []);
}

/** Fine filaments with anthers rising out of the throat. */
function useStamens() {
  return useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      const spread = 0.05 + (i % 2) * 0.03;
      const top = new THREE.Vector3(Math.cos(a) * (spread + 0.05), FLOWER_RIM_Y + 0.16 + (i % 3) * 0.04, Math.sin(a) * (spread + 0.05));
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.25, 0),
        new THREE.Vector3(Math.cos(a) * spread * 0.5, 0.65, Math.sin(a) * spread * 0.5),
        top,
      ]);
      return { geometry: new THREE.TubeGeometry(curve, 24, 0.006, 6, false), tip: top };
    });
  }, []);
}

function useStem() {
  return useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(0.05, -0.6, 0.02),
      new THREE.Vector3(-0.08, -1.3, -0.04),
      new THREE.Vector3(-0.02, -2.2, 0),
    ]);
    return new THREE.TubeGeometry(curve, 64, 0.028, 10, false);
  }, []);
}

export function GlassFlower(props: React.ComponentProps<"group">) {
  const throat = useThroat();
  const petal = usePetal();
  const stamens = useStamens();
  const stem = useStem();
  const sway = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!sway.current || sceneState.reducedMotion) return;
    time.current += Math.min(delta, 0.05);
    const t = time.current;
    sway.current.rotation.z = Math.sin(t * 0.5) * 0.025 + sceneState.pointer.x * -0.02;
    sway.current.rotation.x = Math.cos(t * 0.4) * 0.02;
  });

  return (
    <group {...props}>
      <group ref={sway}>
        <mesh geometry={throat}>
          <meshPhysicalMaterial {...FROSTED_GLASS} />
        </mesh>
        {Array.from({ length: PETALS }, (_, i) => (
          <mesh key={i} geometry={petal} rotation-y={(i / PETALS) * Math.PI * 2}>
            <meshPhysicalMaterial {...FROSTED_GLASS} />
          </mesh>
        ))}
        {stamens.map((s, i) => (
          <group key={i}>
            <mesh geometry={s.geometry}>
              <meshStandardMaterial color="#f3d9a4" emissive="#ffb347" emissiveIntensity={0.35} roughness={0.4} />
            </mesh>
            <mesh position={s.tip} scale={0.022}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshStandardMaterial color="#ffd27a" emissive="#ffab3d" emissiveIntensity={1.4} roughness={0.3} />
            </mesh>
          </group>
        ))}
        {/* Nectar glow deep in the throat */}
        <pointLight position={[0, FLOWER_RIM_Y * 0.6, 0]} color="#ffb347" intensity={1.6} distance={1.6} decay={2} />
      </group>
      <mesh geometry={stem}>
        <meshPhysicalMaterial {...FROSTED_GLASS} color="#dfe8d8" attenuationColor="#cfe3c4" />
      </mesh>
    </group>
  );
}
