"use client";

import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { FLOWER_RIM_Y, GlassFlower } from "./GlassFlower";
import { Hummingbird } from "./Hummingbird";
import { ModelBoundary } from "./ModelBoundary";

/** Flower placement and the nectar point the bird hovers over (world units). */
const FLOWER_POS = new THREE.Vector3(0.35, -1.15, 0);
const FLOWER_SCALE = 1.15;
const NECTAR = new THREE.Vector3(FLOWER_POS.x, FLOWER_POS.y + FLOWER_RIM_Y * FLOWER_SCALE + 0.12, FLOWER_POS.z);
/** What the camera looks at: between the nectar and the bird. */
const FOCUS = new THREE.Vector3(0.2, -0.05, 0);

/**
 * Studio rig: warm amber rim behind/above, cool violet + cyan fills that follow
 * the pointer, with the environment rotated so speculars slide across the glass.
 */
function Lights() {
  const violet = useRef<THREE.PointLight>(null);
  const cyan = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const { x, y } = sceneState.pointer;
    const p = sceneState.page;
    if (violet.current) {
      const v = violet.current.position;
      v.x = THREE.MathUtils.damp(v.x, x * 4 - 1.8, 3, dt);
      v.y = THREE.MathUtils.damp(v.y, y * 2.5 + 1.2, 3, dt);
      v.z = 3;
    }
    if (cyan.current) {
      const c = cyan.current.position;
      c.x = THREE.MathUtils.damp(c.x, -x * 3.5 + 2.2, 3, dt);
      c.y = THREE.MathUtils.damp(c.y, -y * 2 - 1.2, 3, dt);
      c.z = 2.2;
    }
    if (rim.current) {
      // Keep the rim behind the subject relative to the orbiting camera.
      const cam = state.camera.position;
      rim.current.position.set(-cam.x * 0.8 + x * 0.5, 4.5, -cam.z * 0.8);
      rim.current.intensity = 4 + sceneState.press * 3;
    }
    state.scene.environmentRotation.set(y * 0.2, x * 0.6 + p * Math.PI, 0);
  });

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight ref={rim} color="#ffb347" intensity={4} position={[-3, 4.5, -5]} />
      <directionalLight color="#fff4e6" intensity={0.6} position={[2, 3, 4]} />
      <pointLight ref={violet} color="#8b5cf6" intensity={10} distance={12} decay={1.6} position={[-2, 1, 3]} />
      <pointLight ref={cyan} color="#22d3ee" intensity={9} distance={12} decay={1.6} position={[2, -1, 2]} />
    </>
  );
}

/** Orbits the camera through the scroll story. */
function CameraRig() {
  const smooth = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    smooth.current = THREE.MathUtils.damp(smooth.current, sceneState.page, 2.2, dt);
    const p = smooth.current;
    const angle = p * Math.PI * 1.25 + sceneState.chapters * 0.4;
    const radius = 4.6 - Math.sin(p * Math.PI) * 0.9;
    const { x, y } = sceneState.pointer;
    state.camera.position.set(
      FOCUS.x + Math.sin(angle) * radius + x * 0.2,
      FOCUS.y + 0.35 + Math.sin(p * Math.PI * 2) * 0.6 + y * 0.15,
      Math.cos(angle) * radius,
    );
    state.camera.lookAt(FOCUS);
  });

  return null;
}

/**
 * Guides the bird on a gentle arc around the flower as the chapters scroll,
 * always turning to face the nectar, nudged by the pointer and darting in on press.
 */
function BirdFlight({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const smooth = useRef({ c: 0 });
  const tmp = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const s = smooth.current;
    s.c = THREE.MathUtils.damp(s.c, sceneState.chapters + sceneState.page * 0.3, 2, dt);

    const theta = -0.9 + s.c * Math.PI * 1.1;
    const radius = 0.62 - sceneState.press * 0.22 - Math.sin(s.c * Math.PI) * 0.08;
    const target = tmp.current.set(
      NECTAR.x + Math.sin(theta) * radius + sceneState.pointer.x * 0.12,
      NECTAR.y + 0.32 + Math.sin(s.c * Math.PI * 2) * 0.1 + sceneState.pointer.y * 0.08,
      NECTAR.z + Math.cos(theta) * radius,
    );
    const ease = sceneState.reducedMotion ? 20 : 3.2;
    g.position.x = THREE.MathUtils.damp(g.position.x, target.x, ease, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, target.y, ease, dt);
    g.position.z = THREE.MathUtils.damp(g.position.z, target.z, ease, dt);

    // Face the nectar (model's +Z is its beak) with a slight downward pitch.
    const dx = NECTAR.x - g.position.x;
    const dz = NECTAR.z - g.position.z;
    const yaw = Math.atan2(dx, dz);
    let diff = yaw - g.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    g.rotation.y += diff * Math.min(1, dt * 4);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.22, 3, dt);
  });

  return <group ref={ref} position={[NECTAR.x - 0.5, NECTAR.y + 0.35, NECTAR.z + 0.35]}>{children}</group>;
}

/** Scales the composition down on narrow portrait screens (vertical FOV). */
function Composition({ children }: { children: React.ReactNode }) {
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const fit = Math.max(0.5, Math.min(1, aspect / 0.85));
  return <group scale={fit}>{children}</group>;
}

/** Global pointer + "press the glass" listeners (canvas sits under the DOM). */
function usePointerBridge() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest("a, button, input, textarea, select, label, [data-no-press]")) return;
      sceneState.press = 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);
}

/** Press energy decays smoothly back to rest. */
function PressDecay() {
  useFrame((_, delta) => {
    sceneState.press = THREE.MathUtils.damp(sceneState.press, 0, 1.8, Math.min(delta, 0.05));
  });
  return null;
}

export default function SceneCanvas() {
  usePointerBridge();

  return (
    <Canvas
      className="!fixed inset-0"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.3, 4.6], fov: 35, near: 0.05, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
      }}
    >
      {/* Procedural studio — crisp speculars without any HDR download. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffb347" position={[-4, 4, -4]} rotation-y={Math.PI / 4} scale={[3, 7, 1]} />
        <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#8b5cf6" position={[5, 1, 2]} rotation-y={-Math.PI / 2.5} scale={[4, 5, 1]} />
        <Lightformer form="ring" intensity={1.6} color="#22d3ee" position={[-2, -3, 4]} rotation-x={-Math.PI / 4} scale={3} />
        <Lightformer form="rect" intensity={1.2} color="#ffe9d6" position={[0, 0, 6]} scale={[6, 3, 1]} />
      </Environment>
      <Lights />
      <CameraRig />
      <PressDecay />
      <Composition>
        <GlassFlower position={FLOWER_POS} scale={FLOWER_SCALE} />
        <ModelBoundary>
          <Suspense fallback={null}>
            <BirdFlight>
              <Hummingbird />
            </BirdFlight>
          </Suspense>
        </ModelBoundary>
        <Sparkles count={36} color="#ffd9a0" size={2.2} scale={[4, 3, 3]} position={[0.2, 0, 0]} speed={0.25} opacity={0.6} />
      </Composition>
    </Canvas>
  );
}
