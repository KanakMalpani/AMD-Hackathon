## LaunchMyIdea AI — Frontend Landing Page

A single-page, dark, futuristic "launch lab" landing experience. Frontend only — no backend, no auth, no AI calls. All interactions simulated with mock data and Framer Motion.

### Design system
- Background: `#070707` charcoal with two soft radial glows (red top-left, green bottom-right) + faint grid pattern overlay (low opacity).
- Primary red `#FF2D2D` (CTAs, active states, highlights), neon green `#3CFF7A` (success, completion, live, growth metrics only).
- Cards `#111111`, soft cards `#181818`, borders `#2A2A2A`. Text `#F8F8F8` / muted `#A1A1AA` / weak `#71717A`.
- Red glow `rgba(255,45,45,0.35)`, green glow `rgba(60,255,122,0.35)`.
- Font: Space Grotesk for headings, Inter for body (Google Fonts).
- All tokens wired into `src/styles.css` as CSS variables + Tailwind theme inline mapping.

### Page structure (single route `/`)
1. **Navbar** — sticky glass, fades down on load, increases opacity on scroll, animated red underline links, glowing CTA "Launch My Idea".
2. **Hero** — two-column. Left: pill badge with pulsing green dot, line-staggered headline (`launch-ready` highlighted red w/ glow halo), subheading, primary "Launch My Idea" + secondary "Watch Demo".
3. **Idea Core Visual** (right of hero) — abstract glass orb labeled "Your Idea" with rotating red rings, floating particles, 6 orbiting output blocks (Validate, Plan, Build, Market, Simulate, Review) connected by pulsing red lines and occasional green pulses. Mouse-tilt parallax (max 6–8°).
4. **Idea Input Section** — large dark card with textarea, focus red glow, typing "signal" line, four example chips that auto-fill the textarea with sample ideas, Generate button.
5. **Simulated Launch Loader** — inline expansion after Generate click: 6 sequential steps (700–900ms each), red→green progress bar, 3 shimmering skeleton cards, ends with mock result card (87% readiness, green status, 3 bullets).
6. **How It Works** — horizontal 4-step timeline (vertical on mobile) with drawing red line, pulsing number badges, completed check pops.
7. **Features** — 8 feature cards in responsive grid, hover lift + 3D tilt + red border glow.
8. **Growth / Proof** — left: Raw Idea card → animated red arrow → Launch Package card with green checks. Right: 4 metric cards with count-up numbers and progress bars (Readiness 87%, Tasks 24, Revenue ₹1.2L/month, Timeline 48h).
9. **Demo Preview** — single wide glass panel, 3 columns (Input / vertical Progress timeline / Output Summary). Scales/fades in on scroll, timeline lights up sequentially, score counts up.
10. **Final CTA** — strong red radial glow, headline, subheading, pulsing "Launch My Idea" button, small green "AI launch system ready" status.
11. **Footer** — minimal, brand + small links.

### Reusable components (`src/components/`)
- `Navbar`, `AnimatedButton`, `HeroSection`, `IdeaCoreVisual`, `IdeaInputSection`, `LoadingSequence`, `HowItWorks`, `FeatureCard`, `GrowthSection`, `DemoPreview`, `FinalCTA`, `RevealSection` (scroll-reveal wrapper using Framer Motion `useInView`), `CountUpMetric`, `BackgroundFX` (radial glows + grid).

### Animation rules (Framer Motion)
- Entrance: navbar fade-down, hero badge fade-up, headline line-by-line stagger (0.12s), buttons stagger, hero visual scale+fade.
- Hover: buttons scale 1.035 + y -2 + red glow + diagonal sweep; cards y -6 + tilt + border glow; chips x +4 + red border; icons y -3.
- Click: button ripple + 0.98 scale 120ms.
- Scroll: every major section fades up; metric numbers count up only when visible; progress bars fill on view; demo timeline animates on view.
- Parallax: background glow orbs translate slowly with scroll; hero core tilts with mouse.
- `prefers-reduced-motion` honored — disables non-essential motion.

### Tech / files
- React + TanStack Start (existing), Tailwind v4, Framer Motion, lucide-react.
- Install: `framer-motion`.
- Add Google Fonts link in `src/routes/__root.tsx` head.
- Update `src/styles.css` with full color token set + grid-pattern utility + glow shadows.
- Replace placeholder `src/routes/index.tsx` with the assembled landing page.
- Update root meta (title/description/og) for "LaunchMyIdea AI".

### Out of scope (per request)
No backend, no Lovable Cloud, no APIs, no auth, no AI calls, no database, no agent cards, no avatars, no dashboard on landing. All data is mock; all flows simulated client-side.
