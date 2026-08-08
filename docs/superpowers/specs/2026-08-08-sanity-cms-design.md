# Sanity CMS integration for portfolio content

## Context

The portfolio (`waleed-ahmed-portfolio`) is a static export Next.js app (`output: 'export'` in `next.config.mjs`, images `unoptimized: true`). All content currently lives in `content/*.yaml`, loaded at build time by `lib/content.ts` (`fs` + `js-yaml`, validated with `zod`), and rendered by server components (`app/page.tsx`) that pass the data down as props.

Two categories of content exist today:

1. **Collections** already in YAML: `experiences/*.yaml`, `projects/*.yaml`, `skills.yaml`, `certifications.yaml`, `socials.yaml`.
2. **Section copy hardcoded in JSX** — not in YAML at all today: Hero name/rotating-roles/headline/subtext, About's headline/body paragraphs/"currently working with" label/tagline, Skills/Experience/Projects/Contact section eyebrow labels and (for Skills) the subheadline.

Goal: make **all** of the above editable from a Sanity Studio, while keeping the YAML files as a working fallback — if Sanity is ever abandoned, the repo should be immediately hand-editable exactly as it is today, with no unwinding required.

Because the site is a static export, there is no server at request time to talk to Sanity — everything must be resolved at build time.

Sanity project id: `qevudxof`, org id: `oNQfEIkeR` (free tier).

## Architecture

**Sanity is the source of truth while in use. The build regenerates `content/*.yaml` from Sanity before `next build` runs. `lib/content.ts` and every component are unmodified in how they consume YAML** — only the six section components gain new singleton-copy props (see below), sourced from newly-added YAML files.

```
Studio edit → Publish
   → Sanity webhook → Vercel Deploy Hook
   → Vercel build: `npm run sync-sanity` (prebuild) → overwrites content/*.yaml
   → `next build` reads YAML exactly as it does today
   → static export deployed
```

If Sanity is ever discontinued: delete the `sync-sanity` prebuild step (or just stop publishing) and hand-edit `content/*.yaml` directly, same as before this project existed. No data migration back is needed since YAML is always kept current as of the last successful build.

Trade-off accepted: publishing content takes roughly one Vercel build (~1 min) to go live, not instant. Confirmed acceptable.

## Sanity schema

**Singletons** (each edited as a single document in Studio, one per section — holds the copy currently hardcoded in JSX):

| Singleton | Fields |
|---|---|
| `siteSettings` | `name`, `roles` (array of strings, Hero rotator), `heroHeadline`, `heroSubtext` (e.g. "Currently building things from Karachi."), `footerCta` (e.g. "Let's build something together") |
| `aboutSection` | `eyebrow` ("About"), `headline`, `paragraphs` (array of text blocks), `expertiseLabel` ("Currently working with"), `tagline` ("still learning.") |
| `skillsSection` | `eyebrow`, `headline` |
| `experienceSection` | `eyebrow` |
| `projectsSection` | `eyebrow` |
| `contactSection` | `eyebrow` ("Contact") |

**Collections** (documents you add/remove/reorder freely; `order` drives sequence exactly like today's YAML):

| Collection | Fields |
|---|---|
| `experience` | `order`, `chapter`, `title`, `date`, `description`, `technologies` (tags), `featured` (bool) |
| `project` | `order`, `image` (Sanity image asset), `status`, `title`, `description`, `role`, `stack` (tags), `outcome`, `links.visit`, `links.github`, `links.caseStudy`, `featured` (bool) |
| `skill` | `order`, `name`, `category`, `icon` (string, lucide icon name), `expertise` (bool) |
| `certification` | `order`, `title`, `issuer`, `date`, `credentialUrl`, `icon` |
| `social` | `label`, `href`, `icon` |

Notes:
- `skill.expertise: true` continues to drive the About section's "currently working with" badges — no separate list to maintain.
- `icon` fields stay plain strings matching the existing lucide-react name → component maps in `lib/icons.ts` and `Footer.tsx`. No icon picker UI, no image-icons — you type the same names you use today (e.g. `"linkedin"`, `"atom"`).
- Studio desk structure: singletons appear as a single fixed item each (no "create new"); collections appear as orderable lists (drag-to-reorder writes the `order` field).

## Images

Project images move to Sanity's native `image` type, uploaded per-project in Studio. `sync-sanity` resolves each image to its Sanity CDN URL (via `@sanity/image-url`) and writes that URL straight into the generated `image:` field in `content/projects/*.yaml` — no local file download step. `next.config.mjs` gets `images.remotePatterns` updated to allow `cdn.sanity.io` (kept alongside the existing `unoptimized: true`, since this is a static export).

Existing files in `public/images/projects/` are left in place untouched; only newly-edited-in-Sanity projects will point at CDN URLs. This is a live concern only if you re-upload an existing project's image in Studio — until you do, its path stays local.

## New YAML files (for section copy)

Six new files mirror the singletons, so `lib/content.ts` can load them the same way it loads everything else:

- `content/site-settings.yaml`
- `content/sections/about.yaml`, `skills.yaml`, `experience.yaml`, `projects.yaml`, `contact.yaml`

Each gets a zod schema + a `getX()` accessor in `lib/content.ts`, following the exact pattern already used for `getSocials`/`getSkills`. `app/page.tsx` passes the loaded singleton data into the corresponding component as new props; each of the six components swaps its hardcoded JSX strings for those props (e.g. `About`'s three `<p>` paragraphs become `.map()` over `aboutSection.paragraphs`).

## Sync script (`scripts/sync-sanity.ts`)

- Runs via `ts-node`/`tsx` as an `npm run sync-sanity` script, wired as `prebuild` in `package.json` (so `npm run build` always syncs first; also runnable manually).
- Uses `@sanity/client` with a read-only token (env var `SANITY_READ_TOKEN`, project id `qevudxof`, dataset `production`) to run one GROQ query per document/collection type.
- Transforms each result to the exact shape `lib/content.ts`'s zod schemas expect (field names match 1:1 by design, so this is mostly a straight `yaml.dump`).
- Overwrites `content/*.yaml` and `content/experiences/*.yaml` / `content/projects/*.yaml` (one file per document, named by slug/order, matching today's convention) and the six new section-copy files.
- If the Sanity fetch fails (network/auth error), the script exits non-zero **without touching existing YAML** — a failed sync never corrupts the fallback; the last-known-good YAML simply gets built again.

## Studio

- Embedded in this repo via `next-sanity`, mounted at `app/studio/[[...tool]]/page.tsx` as a client component tree (Studio is inherently CSR, compatible with `output: 'export'`).
- Sanity config file at repo root (`sanity.config.ts`) declares project id `qevudxof`, dataset `production`, and the schema types above.
- Deployed automatically as part of the same Vercel static export — visiting `yoursite.com/studio` loads the editor.

## One-time migration

A one-off script (`scripts/migrate-to-sanity.ts`, run manually once, not part of the build) reads the current `content/*.yaml` files plus the hardcoded section copy (typed directly into the script as the six singleton documents) and creates matching documents in Sanity via `@sanity/client` with a write token. Run once, then delete or archive the script — after this, Studio is the only place content gets entered.

## Environment / secrets

- `SANITY_READ_TOKEN` — read-only, used by `sync-sanity` at build time (set in Vercel env vars).
- `SANITY_WRITE_TOKEN` — write-capable, used only locally for the one-time migration script; never committed, never set in Vercel.
- `NEXT_PUBLIC_SANITY_PROJECT_ID=qevudxof`, `NEXT_PUBLIC_SANITY_DATASET=production` — used by both the Studio config and `sync-sanity`.

## Webhook

A Sanity webhook (configured in sanity.io/manage) fires on document publish → hits a Vercel Deploy Hook URL → triggers a full rebuild, which runs `sync-sanity` then `next build`.

## Out of scope

- No live/no-rebuild delivery path (ISR, client-side fetch) — explicitly ruled out given the static export constraint and the "rebuild on publish" decision.
- No rich text/portable text editor for body copy — plain strings/text areas are enough for the copy involved (short paragraphs, no inline formatting needs identified).
- `certifications` collection is kept in the schema and synced, matching its current (currently-commented-out-in-JSX) presence in the codebase — no behavior change to whether it renders.
