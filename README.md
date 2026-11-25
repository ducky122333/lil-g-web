# Lil G Web

Portfolio site for **Lil G Web**: digital objects & web worlds. It's a single-page scroll story built around a procedurally generated iridescent glass blossom.

## Stack

- **Next.js 16** (App Router, TypeScript, static prerender)
- **Tailwind CSS v4**
- **GSAP** + `ScrollTrigger` + `@gsap/react` (`useGSAP`)
- **Lenis**, driven by `gsap.ticker` (no separate rAF loop)
- **Framer Motion**: preloader and inquiry drawer
- **React Three Fiber** + **drei** + **three**: all 3D is procedural (no `.glb`, HDR or image files)

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
    SmoothScroll.tsx   Lenis on gsap.ticker, scroll lock during preloader + drawer
    Preloader.tsx      0–100% counter, "Skip"
    Scene.tsx          next/dynamic(..., { ssr: false }) wrapper for the canvas
    three/             SceneCanvas (lights, camera rig, procedural env), Blossom + GLSL
    Hero.tsx           character-level reveal
    Chapters.tsx       pinned, scrubbed 4-statement sequence (orbits the camera)
    ClosingCTA.tsx     "Inquire about a project"
    InquiryDrawer.tsx  slide-over form with a confirmation state
  lib/
    gsap.ts            client-only plugin registration
    sceneState.ts      mutable DOM → WebGL bridge (scroll, pointer, press)
```

## Notes

- **Press the glass:** pointer-down anywhere that isn't a control sends a ripple through the form at the pressed point. Pointer movement shifts the violet/cyan fill lights and rotates the environment reflections.
- **Reduced motion:** with `prefers-reduced-motion`, the preloader is shortened, character reveals become simple fades, the chapters render as plain flowing text (no pin), and idle 3D motion stops.
- **Inquiry form:** submission is simulated client-side. To deliver real inquiries, connect `onSubmit` in `InquiryDrawer.tsx` to a Route Handler or a form service.

## Deploy

Import the repository into Vercel. No environment variables or extra config are needed.
