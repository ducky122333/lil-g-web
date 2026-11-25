"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";

export const HUMMINGBIRD_URL = "/models/hummingbird.glb";

/** Longest side of the bird after normalisation, in world units. */
const TARGET_SIZE = 0.95;
/**
 * Extra rotation applied to the raw model so its beak points along local +Z.
 * glTF models usually face +Z already; adjust here if your export differs.
 */
const MODEL_ROTATION: [number, number, number] = [0, 0, 0];

const NO_SHIMMER = /eye|pupil|iris|cornea|beak|bill|tongue/i;
const IDLE_CLIP = /hover|idle|fly|flap|loop/i;
/** Root-bone position tracks (e.g. "Root2_03.position") carry the flight path. */
const ROOT_MOTION = /^(_?root[^.]*|Root[^.]*)\.position$/i;

/** Swap standard materials for physical ones that keep every map and colour. */
function enhanceMaterial(source: THREE.Material, shimmer: boolean) {
  if (!(source instanceof THREE.MeshStandardMaterial)) return source;
  const physical =
    source instanceof THREE.MeshPhysicalMaterial
      ? source.clone()
      : (THREE.MeshStandardMaterial.prototype.copy.call(new THREE.MeshPhysicalMaterial(), source) as THREE.MeshPhysicalMaterial);
  physical.envMapIntensity = shimmer ? 1.35 : 1;
  physical.clearcoat = Math.max(physical.clearcoat, shimmer ? 0.45 : 0.8);
  physical.clearcoatRoughness = shimmer ? 0.35 : 0.1;
  if (shimmer) {
    physical.iridescence = Math.max(physical.iridescence, 0.35);
    physical.iridescenceIOR = 1.4;
    physical.iridescenceThicknessRange = [180, 520];
  }
  physical.needsUpdate = true;
  return physical;
}

export function Hummingbird(props: React.ComponentProps<"group">) {
  const { scene, animations } = useGLTF(HUMMINGBIRD_URL);
  const rig = useRef<THREE.Group>(null);
  const time = useRef(0);
  // Drop root-motion translation so the clip flaps in place and the scroll
  // choreography alone decides where the bird flies.
  const clips = useMemo(
    () =>
      animations.map((clip) => {
        const c = clip.clone();
        c.tracks = c.tracks.filter((t) => !ROOT_MOTION.test(t.name));
        return c;
      }),
    [animations],
  );
  const { actions, names } = useAnimations(clips, rig);
  const isStatic = animations.length === 0;

  // Normalise: scale the longest side to TARGET_SIZE and centre on the origin.
  const fit = useMemo(() => {
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene, true);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = TARGET_SIZE / Math.max(size.x, size.y, size.z, 1e-6);
    return { scale, offset: center.multiplyScalar(-scale).toArray() as [number, number, number] };
  }, [scene]);

  // Physical light response on feathers; eyes and beak stay crisp.
  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      // Skinned bounds go stale as bones animate; never cull the bird.
      mesh.frustumCulled = false;
      const shimmer = !NO_SHIMMER.test(mesh.name);
      const swap = (m: THREE.Material) => enhanceMaterial(m, shimmer && !NO_SHIMMER.test(m.name));
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
    });
  }, [scene]);

  // Play the embedded hover/idle clip if there is one.
  useEffect(() => {
    if (!names.length) return;
    const name = names.find((n) => IDLE_CLIP.test(n)) ?? names[0];
    const action = actions[name];
    action?.reset().fadeIn(0.4).play();
    return () => {
      action?.fadeOut(0.3);
    };
  }, [actions, names]);

  // Procedural life: hover bob, gentle tilt and micro-rotation (stronger if static).
  useFrame((_, delta) => {
    if (!rig.current) return;
    const reduced = sceneState.reducedMotion;
    if (!reduced) time.current += Math.min(delta, 0.05);
    const t = time.current;
    const k = isStatic ? 1 : 0.45;
    const r = rig.current;
    r.position.y = Math.sin(t * 2.1) * 0.03 * k + Math.sin(t * 5.3) * 0.006 * k;
    r.position.x = Math.sin(t * 1.3) * 0.012 * k;
    r.rotation.z = Math.sin(t * 1.7) * 0.06 * k;
    r.rotation.x = Math.sin(t * 1.1 + 0.6) * 0.05 * k - sceneState.press * 0.25;
    r.rotation.y = Math.sin(t * 0.9) * 0.08 * k;
  });

  return (
    <group {...props}>
      <group ref={rig}>
        <group rotation={MODEL_ROTATION}>
          <group scale={fit.scale} position={fit.offset}>
            <primitive object={scene} />
          </group>
        </group>
      </group>
    </group>
  );
}
