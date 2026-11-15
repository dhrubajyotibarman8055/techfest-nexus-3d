# NEXUS Techfest 2027 — Immersive 3D Experience

A cinematic, scroll-driven 3D website for a technology festival. You don't scroll *down* a page — you **fly through NEXUS CITY**: one continuous camera path travels through seven 3D zones, each tied to a section of the site.

| Zone | Section | 3D environment |
| --- | --- | --- |
| 01 Nexus Core | Hero | Distorted-chrome core, gyroscopic rings, orbiting shards, shadow-casting landing pad. Reacts to mouse, scroll and click (shockwave). |
| 02 Grid City | About | Procedural neon metropolis (instanced GLSL buildings with live windows), flying traffic, landmark tower, light pillars. |
| 03 Arena Ring | Events | Six hand-built objects (gear, neural icosahedron, code lattice, D20, torus-knot, microchip). Horizontal scroll rotates the ring; hovering a card lifts its 3D twin. |
| 04 Shard Field | Workshops & Experiences | Drifting metallic shards + a second interactive canvas (drag to rotate) that changes model per category. |
| 05 Time Tunnel | Schedule | Hex tunnel with travelling data packets; camera flies through it as the timeline fills. |
| 06 Monolith Gate | Sponsors | Floating glass monoliths with neon edges. |
| 07 The Portal | Final CTA + footer | Swirling shader portal; the camera pushes into it. |

## Stack

React 19 · Vite · TypeScript · Tailwind CSS 4 · Three.js · React Three Fiber · Drei · `@react-three/postprocessing` (bloom, chromatic aberration, vignette, ACES) · GSAP + ScrollTrigger · Framer Motion · Lenis · Lucide.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/ (single self-contained index.html)
npm run preview    # serve the production build
```

Requires Node 18+.

## Environment variables

None are required. Optional:

| Variable | Purpose |
| --- | --- |
| `VITE_REGISTER_URL` | If set, every **Register** button opens this URL (e.g. Google Form, Luma, Eventbrite) in a new tab. If empty, the built-in demo registration modal is used (data stays in your browser's `localStorage`, key `nexus_registrations`). |

Copy `.env.example` to `.env` to use it.

## Replace the sample content

**Everything is sample content** (fest name, dates, venue, sponsors, stats, schedule, socials, e-mail). It's all in one file: [`src/data.ts`](src/data.ts). Sample sponsors are tagged "Sample" in the UI. No official claims are made.

Additional tweaks:
- Camera path / zone keyframes: `src/scene/CameraRig.tsx`
- Scroll → zone mapping & hold ranges: `src/state.ts`
- Colours & fonts: `src/index.css` (`@theme`)

## Performance, accessibility & fallbacks

- Single fixed WebGL canvas; zones are hidden (`visible=false`) when the camera is far away; instancing for buildings, traffic, shards, tunnel rings.
- Mobile / coarse-pointer mode: lower DPR, fewer particles & buildings, no shadows, no chromatic aberration, no MSAA, reduced parallax.
- `PerformanceMonitor` auto-lowers resolution and drops costly post effects if the frame rate drops.
- The workshop viewer canvas only renders while on screen (IntersectionObserver).
- `prefers-reduced-motion`: Lenis smooth-scroll disabled, reveal animations skipped, ambient motion slowed, CSS animations neutralised.
- WebGL missing or scene crash → animated CSS gradient fallback (error boundary); the site stays fully usable.
- Keyboard accessible nav, menu (`Esc` closes), modal (`Esc` closes), ARIA tabs, visible focus rings, semantic headings.
- Optional ambient sound (procedural WebAudio, off by default) via the speaker button.

## Deploy

**Vercel**
1. Push this folder to a GitHub repo.
2. In Vercel: *Add New → Project → Import* the repo. Framework preset: **Vite**.
3. Build command `npm run build`, output directory `dist`. Deploy.

**Netlify**
1. Push to GitHub, then *Add new site → Import an existing project*.
2. Build command `npm run build`, publish directory `dist`. Deploy.

(Or drag-and-drop the `dist/` folder into Netlify Drop. The build is a single self-contained `index.html`.)

## Notes

- Web fonts (Unbounded, Space Grotesk, JetBrains Mono) load from Google Fonts; system fonts are used as a fallback if offline.
- This repository has not been published anywhere and no screen recording or hosted deployment exists yet — add your own GitHub URL / recording link here once created.
