# Waleed Ahmed — Portfolio

A calm, editorial portfolio built with Next.js (App Router), TypeScript, Tailwind CSS,
and Framer Motion. It uses a quiet interactive canvas background on the Hero/About
sections, a custom four-pointed-star chapter timeline in Experience, and a fully
content-driven architecture so you never have to touch component code to update
your projects, experience, skills, or socials.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To build for production:

```bash
npm run build
npm run start
```

## Design tokens

| Role | Value |
| --- | --- |
| Background | `#F7F4EE` |
| Card | `#FCFBF9` |
| Primary text | `#1B1B1B` |
| Secondary text | `#66635E` |
| Accent — terracotta | `#B76E56` |
| Accent — olive | `#70755B` |
| Accent — dusty blue | `#7B92A6` |
| Dark background | `#111111` / `#171717` |

Fonts: **Geist** (via the self-hosted `geist` package) for display and body type,
**Instrument Serif** and **Cormorant** (via `@fontsource`) for the occasional
handwritten-feeling notes. All fonts are self-hosted — no runtime calls to Google Fonts.

Icons are all from **lucide-react** for a single, consistent icon family — no emojis
anywhere in the UI.

## Editing content — no component code changes needed

Content lives in YAML files under `content/`:

```
content/
  experiences/         # chapters shown in the Experience timeline
  projects/             # case studies shown in the Work section
  skills.yaml            # Expertise badges (About) + Skills & Certifications section
  certifications.yaml    # cards shown in the Skills & Certifications section
  socials.yaml           # footer contact links
```

Everything is read and validated at build time with Zod (`lib/content.ts`), so a
malformed file fails the build with a clear error instead of shipping broken data.

### Add a new experience

Create a new `.yaml` file in `content/experiences/`:

```yaml
order: 5
chapter: "Chapter IV"
title: "New role"
date: "2026 — Present"
description: "What this chapter was about."
technologies:
  - Next.js
  - TypeScript
featured: true
```

### Add a new project

Create a new `.yaml` file in `content/projects/`:

```yaml
order: 4
title: "Project name"
description: "One or two sentences."
role: "Your role"
stack:
  - Next.js
  - PostgreSQL
outcome: "The measurable result."
links:
  visit: "https://..."
  github: "https://..."
  caseStudy: "/work/project-slug"
featured: true
```

### Add a new skill / expertise badge

Add an entry to `content/skills.yaml`. Set `expertise: true` to also show it as an
animated badge in the About section; every skill (regardless of `expertise`) shows
up grouped by `category` in the Skills & Certifications section.

```yaml
- order: 13
  name: "GraphQL"
  category: "Backend"
  icon: "network"
  expertise: false
```

`icon` accepts any kebab-case key from the map in `lib/icons.ts`. Add a new lucide
icon import there if you need one that isn't already listed.

### Add a new certification

Add an entry to `content/certifications.yaml`:

```yaml
- order: 4
  title: "Certification name"
  issuer: "Issuing organization"
  date: "2026"
  credentialUrl: "https://..."
  icon: "award"
```

### Add / remove a social link

Edit `content/socials.yaml`. `icon` must match one of the keys in the `iconMap` at
the top of `components/Footer.tsx`.

## Things to personalize before launch

- Swap the placeholder social links and resume file in `content/socials.yaml`
  and `public/`.
- Replace the gradient project placeholders in `components/Projects.tsx` with real
  product screenshots (use `next/image` for automatic AVIF/WebP + lazy loading).
- Update `siteUrl` in `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts` to your
  real domain once it's live.
- Add your real social profile URLs to the `sameAs` array in the JSON-LD block in
  `app/layout.tsx`.

## Notable implementation details

- `components/InteractiveBackground.tsx` — a lightweight canvas dot-field that reacts
  to the pointer with a soft glow. It reads the DOM position of `#top`, `#about`, and
  `#experience` on every scroll tick to fade itself from fully visible on the Hero, to
  50% through About, to fully hidden by the time Experience appears — no scroll library
  needed. Respects `prefers-reduced-motion`.
- `components/TimelineStar.tsx` — the four-pointed marker used in the Experience
  timeline. Hand-built from cubic bezier curves (not a stock icon) so the top/bottom
  points are longer than the left/right points, with smooth, rounded concave curves
  between every point. Animates with a slow breathing scale only — no rotation, no
  wobble.
- `components/CustomCursor.tsx` — the tiny circle cursor that expands and inverts
  color over interactive elements, tuned for a snappy, low-latency feel (disabled
  automatically on touch devices).
- `components/Nav.tsx` — blurs and gains a hairline border once you scroll past the
  Hero, swaps the empty logo slot for your full name, and includes a full mobile
  menu (hidden on desktop, where the horizontal nav is already visible).
- `components/Reveal.tsx` — a shared scroll-reveal wrapper used across sections for
  consistent, restrained motion timing (400–700ms, spring-eased).
- `app/og/route.tsx` — a dynamic Open Graph image generated at request time.
- SEO: full metadata, JSON-LD (`Person` + `WebSite`), sitemap, robots, and manifest
  routes are already wired up via the Next.js Metadata API.
