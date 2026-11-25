"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { Blossom } from "./Blossom";

/** Warm amber rim + cool violet/cyan fill that chase the pointer. */
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
      v.x = THREE.MathUtils.damp(v.x, x * 4.5 - 1.5, 3, dt);
      v.y = THREE.MathUtils.damp(v.y, y * 3 + 1.2, 3, dt);
      v.z = 3.2;
    }
    if (cyan.current) {
      const c = cyan.current.position;
      c.x = THREE.MathUtils.damp(c.x, -x * 4 + 2, 3, dt);
      c.y = THREE.MathUtils.damp(c.y, -y * 2.5 - 1.4, 3, dt);
      c.z = 2.4;
    }
    if (rim.current) {
      const a = p * Math.PI * 1.2 + x * 0.4;
      rim.current.position.set(Math.sin(a + Math.PI) * 6, 3 + y, Math.cos(a + Math.PI) * 6);
      rim.current.intensity = 3.2 + sceneState.press * 4;
    }
    // Rotate the environment so reflections slide across the glass.
    state.scene.environmentRotation.set(y * 0.25, x * 0.7 + p * Math.PI, 0);
    state.scene.backgroundRotation.copy(state.scene.environmentRotation);
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight ref={rim} color="#ffb347" intensity={3.2} position={[-4, 3, -6]} />
      <pointLight ref={violet} color="#8b5cf6" intensity={14} distance={14} decay={1.6} position={[-2, 1, 3]} />
      <pointLight ref={cyan} color="#22d3ee" intensity={12} distance={14} decay={1.6} position={[2, -1, 3]} />
    </>
  );
}

/** Orbits the camera through the scroll story. */
function CameraRig() {
  const target = useRef(new THREE.Vector3());
  const smooth = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    smooth.current = THREE.MathUtils.damp(smooth.current, sceneState.page, 2.2, dt);
    const p = smooth.current;
    const c = sceneState.chapters;
    const angle = p * Math.PI * 1.35 + c * 0.35;
    const radius = 6 - Math.sin(p * Math.PI) * 0.9;
    const { x, y } = sceneState.pointer;
    state.camera.position.set(
      Math.sin(angle) * radius + x * 0.25,
      Math.sin(p * Math.PI * 2) * 0.9 + 0.2 + y * 0.2,
      Math.cos(angle) * radius,
    );
    target.current.set(0, Math.sin(p * Math.PI) * -0.2, 0);
    state.camera.lookAt(target.current);
  });

  return null;
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
      sceneState.pressAt = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
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

export default function SceneCanvas() {
  usePointerBridge();

  return (
    <Canvas
      className="!fixed inset-0"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.2, 5.4], fov: 35, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.92;
      }}
    >
      {/* Procedural studio — no HDR files, only emissive light cards. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffb347" position={[-5, 2, -3]} rotation-y={Math.PI / 3} scale={[4, 8, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#8b5cf6" position={[5, 1, 2]} rotation-y={-Math.PI / 2.5} scale={[5, 6, 1]} />
        <Lightformer form="ring" intensity={2.5} color="#22d3ee" position={[0, -4, 4]} rotation-x={-Math.PI / 3} scale={4} />
        <Lightformer form="rect" intensity={0.6} color="#ffffff" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="circle" intensity={2} color="#f472b6" position={[3, -2, -5]} scale={3} />
      </Environment>
      <Lights />
      <CameraRig />
      <Blossom />
    </Canvas>
  );
}
