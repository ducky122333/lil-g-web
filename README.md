# Lil G Web

Portfolio site for **Lil G Web**: digital objects & web worlds. It's a single-page scroll story built around a procedurally generated iridescent glass blossom.

## Stack

- **Next.js 16** (App Router, TypeScript, static prerender)
- **Tailwind CSS v4**
- **GSAP** + `ScrollTrigger` + `@gsap/react` (`useGSAP`)
- **Lenis**, driven by `gsap.ticker` (no separate rAF loop)
- **Framer Motion**: inquiry drawer
- **React Three Fiber** + **drei** + **three**: a hummingbird `.glb` (`public/models/hummingbird.glb`) hovering over a procedural frosted-glass trumpet flower; lighting is procedural (no HDR files)

## Scripts

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Structure

```
src/
  app/                 layout (providers, fixed scene, header, drawer) + page sections
  components/
    AppProvider.tsx    loaded / drawer / lenis / reduced-motion context
    SmoothScroll.tsx   Lenis on gsap.ticker, scroll lock while the drawer is open
    Scene.tsx          next/dynamic(..., { ssr: false }) wrapper for the canvas
    three/             SceneCanvas (lights, camera, bird flight), Hummingbird (useGLTF), GlassFlower
    Hero.tsx           character-level reveal
    Chapters.tsx       pinned, scrubbed 4-statement sequence (orbits the camera)
    ClosingCTA.tsx     "Start a conversation"
    InquiryDrawer.tsx  slide-over form with a confirmation state
  lib/
    gsap.ts            client-only plugin registration
    sceneState.ts      mutable DOM → WebGL bridge (scroll, pointer, press)
```

## Notes

- **Hummingbird model:** place it at `public/models/hummingbird.glb`. It is auto-scaled and centred; an embedded hover/idle clip plays automatically, otherwise a procedural hover is used. If the beak doesn't face the flower, adjust `MODEL_ROTATION` in `Hummingbird.tsx`.
- **Press the glass:** pointer-down anywhere that isn't a control makes the bird dart toward the nectar and flares the amber rim light.
- **Reduced motion:** with `prefers-reduced-motion`, character reveals become simple fades, the chapters render as plain flowing text (no pin), and idle 3D motion stops.
- **Inquiry form:** submission is simulated client-side. To deliver real inquiries, connect `onSubmit` in `InquiryDrawer.tsx` to a Route Handler or a form service.

## Deploy

Import the repository into Vercel. No environment variables or extra config are needed.
