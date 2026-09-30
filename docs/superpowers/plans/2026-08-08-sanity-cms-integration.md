# Sanity CMS Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every piece of portfolio content — About copy, "currently working with" skills, experiences, projects, skills, certifications, and contacts, plus each section's heading/description — editable from an embedded Sanity Studio, while `content/*.yaml` keeps working as a hand-editable fallback if Sanity is ever dropped.

**Architecture:** Sanity is the source of truth while in use. A build-time script (`scripts/sync-sanity.ts`) fetches everything from Sanity and regenerates `content/*.yaml` before `next build` runs; `lib/content.ts` keeps reading YAML exactly as it does today. Studio is embedded at `/studio` inside the same static-exported Next app.

**Tech Stack:** Next.js 15 (App Router, `output: 'export'`), `sanity` v3 (Studio), `next-sanity` (Studio embed), `@sanity/client` + `@sanity/image-url` (sync/migrate scripts), `tsx` (running TS scripts), `js-yaml` + `zod` (already in the repo).

## Global Constraints

- Do not run `git commit` at any point while executing this plan — leave changes staged/unstaged; the user commits when ready.
- No automated test framework exists in this repo today (no jest/vitest config, no `*.test.*` files) — follow that existing convention. Verification steps in this plan are manual (run a script/build and inspect output), not automated unit tests.
- `next.config.mjs` has `output: 'export'` and `images.unoptimized: true` — the whole app is a static export with no server at request time. Studio must work as a purely client-rendered bundle at a single static route; content must be fully resolved at build time (this is why the sync script exists).
- Sanity project id `qevudxof`, org id `oNQfEIkeR`, dataset `production`.
- Field names in every Sanity schema type must match the corresponding zod schema/YAML field names 1:1 (documented per-task below) — this is what makes the sync script a straight transform instead of a remapping layer.
- A failed `sync-sanity` run (network/auth error) must never overwrite existing `content/*.yaml` files — all Sanity fetches complete successfully in memory before any file on disk is touched.

---

### Task 1: Add dependencies and Sanity env/config scaffolding

**Files:**
- Modify: `package.json`
- Create: `sanity/env.ts`
- Create: `sanity.config.ts`
- Create: `sanity.cli.ts`

**Interfaces:**
- Produces: `sanity/env.ts` exports `projectId: string`, `dataset: string`, `apiVersion: string` — consumed by `sanity.config.ts`, `sanity.cli.ts`, and later by `scripts/sanityClient.ts`.

- [ ] **Step 1: Install dependencies**

```bash
npm install sanity next-sanity @sanity/client @sanity/image-url dotenv
npm install -D tsx
```

- [ ] **Step 2: Add npm scripts to `package.json`**

Edit the `"scripts"` block:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "prebuild": "npm run sync-sanity",
    "start": "next start",
    "lint": "next lint",
    "sync-sanity": "tsx scripts/sync-sanity.ts",
    "migrate-to-sanity": "tsx scripts/migrate-to-sanity.ts"
  },
```

(`sync-sanity` and `migrate-to-sanity` will fail with "Cannot find module" until Tasks 7–8 create those scripts — that's expected at this point.)

- [ ] **Step 3: Create `sanity/env.ts`**

```ts
export const apiVersion = "2024-01-01";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
);

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}
```

- [ ] **Step 4: Create `sanity.config.ts` (repo root)**

```ts
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";
import { projectId, dataset } from "./sanity/env";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure })],
});
```

(This will fail to type-check until Task 2 creates `sanity/schemaTypes` and Task 3 creates `sanity/structure.ts` — expected at this point.)

- [ ] **Step 5: Create `sanity.cli.ts` (repo root)**

```ts
import { defineCliConfig } from "sanity/cli";
import { projectId, dataset } from "./sanity/env";

export default defineCliConfig({ api: { projectId, dataset } });
```

- [ ] **Step 6: Create a local env file with the project credentials**

Create `.env.local` (already covered by `.gitignore`'s `.env*.local` rule — do not remove that rule):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=qevudxof
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_READ_TOKEN=
SANITY_WRITE_TOKEN=
```

Leave the two token values blank for now — Task 9 explains how to generate them in sanity.io/manage and fill them in.

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit sanity/env.ts sanity.cli.ts 2>&1 | grep -v "schemaTypes\|structure'"`
Expected: no output (only the two known-missing-module errors from Step 4/5 are filtered out; if anything else appears, fix it before continuing).

---

### Task 2: Define Sanity schema types

**Files:**
- Create: `sanity/schemaTypes/siteSettings.ts`
- Create: `sanity/schemaTypes/aboutSection.ts`
- Create: `sanity/schemaTypes/skillsSection.ts`
- Create: `sanity/schemaTypes/experienceSection.ts`
- Create: `sanity/schemaTypes/projectsSection.ts`
- Create: `sanity/schemaTypes/contactSection.ts`
- Create: `sanity/schemaTypes/experience.ts`
- Create: `sanity/schemaTypes/project.ts`
- Create: `sanity/schemaTypes/skill.ts`
- Create: `sanity/schemaTypes/certification.ts`
- Create: `sanity/schemaTypes/social.ts`
- Create: `sanity/schemaTypes/index.ts`

**Interfaces:**
- Produces: `sanity/schemaTypes/index.ts` exports `schemaTypes: SchemaTypeDefinition[]` — consumed by `sanity.config.ts` (Task 1) and referenced by name (`'siteSettings'`, `'experience'`, etc.) in `sanity/structure.ts` (Task 3).
- Field names on every type below are the exact names `scripts/sync-sanity.ts` (Task 7) and `lib/content.ts` (Task 5) will read.

- [ ] **Step 1: Create the six singleton schema types**

`sanity/schemaTypes/siteSettings.ts`:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "roles",
      title: "Rotating roles (Hero)",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero headline",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heroSubtext",
      title: "Hero subtext",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "footerCta",
      title: "Footer call to action",
      type: "string",
      validation: (r) => r.required(),
    }),
  ],
});
```

`sanity/schemaTypes/aboutSection.ts`:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "aboutSection",
  title: "About Section",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "headline", title: "Headline", type: "text", validation: (r) => r.required() }),
    defineField({
      name: "paragraphs",
      title: "Body paragraphs",
      type: "array",
      of: [{ type: "text" }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "expertiseLabel",
      title: '"Currently working with" label',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "tagline", title: "Tagline", type: "string", validation: (r) => r.required() }),
  ],
});
```

`sanity/schemaTypes/skillsSection.ts`:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "skillsSection",
  title: "Skills Section",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "headline", title: "Headline", type: "text", validation: (r) => r.required() }),
  ],
});
```

`sanity/schemaTypes/experienceSection.ts`:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "experienceSection",
  title: "Experience Section",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow label", type: "string", validation: (r) => r.required() }),
  ],
});
```

`sanity/schemaTypes/projectsSection.ts`:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "projectsSection",
  title: "Projects Section",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow label", type: "string", validation: (r) => r.required() }),
  ],
});
```

`sanity/schemaTypes/contactSection.ts`:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "contactSection",
  title: "Contact Section",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow label", type: "string", validation: (r) => r.required() }),
  ],
});
```

- [ ] **Step 2: Create the five collection schema types**

`sanity/schemaTypes/experience.ts`:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  fields: [
    defineField({ name: "order", title: "Order", type: "number", validation: (r) => r.required() }),
    defineField({ name: "chapter", title: "Chapter", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "date", title: "Date", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Description", type: "text", validation: (r) => r.required() }),
    defineField({
      name: "technologies",
      title: "Technologies",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
  ],
  orderings: [{ title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "chapter" } },
});
```

`sanity/schemaTypes/project.ts`:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({ name: "order", title: "Order", type: "number", validation: (r) => r.required() }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({ name: "status", title: "Status", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Description", type: "text", validation: (r) => r.required() }),
    defineField({ name: "role", title: "Role", type: "string", validation: (r) => r.required() }),
    defineField({ name: "stack", title: "Stack", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "outcome", title: "Outcome", type: "text", validation: (r) => r.required() }),
    defineField({
      name: "links",
      title: "Links",
      type: "object",
      fields: [
        defineField({ name: "visit", title: "Visit URL", type: "url" }),
        defineField({ name: "github", title: "GitHub URL", type: "url" }),
        defineField({ name: "caseStudy", title: "Case study URL", type: "url" }),
      ],
    }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
  ],
  orderings: [{ title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "role", media: "image" } },
});
```

`sanity/schemaTypes/skill.ts`:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "skill",
  title: "Skill",
  type: "document",
  fields: [
    defineField({ name: "order", title: "Order", type: "number", initialValue: 0 }),
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "category", title: "Category", type: "string", initialValue: "General" }),
    defineField({
      name: "icon",
      title: "Icon (lucide-react name, e.g. \"atom\")",
      type: "string",
      initialValue: "sparkle",
    }),
    defineField({
      name: "expertise",
      title: "Show in \"Currently working with\" (About)",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [{ title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "category" } },
});
```

`sanity/schemaTypes/certification.ts`:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "certification",
  title: "Certification",
  type: "document",
  fields: [
    defineField({ name: "order", title: "Order", type: "number", initialValue: 0 }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "issuer", title: "Issuer", type: "string", validation: (r) => r.required() }),
    defineField({ name: "date", title: "Date", type: "string", validation: (r) => r.required() }),
    defineField({ name: "credentialUrl", title: "Credential URL", type: "url" }),
    defineField({ name: "icon", title: "Icon (lucide-react name)", type: "string", initialValue: "award" }),
  ],
  orderings: [{ title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "issuer" } },
});
```

`sanity/schemaTypes/social.ts`:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "social",
  title: "Social / Contact link",
  type: "document",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", title: "URL", type: "string", validation: (r) => r.required() }),
    defineField({ name: "icon", title: "Icon (lucide-react name)", type: "string", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});
```

- [ ] **Step 3: Create `sanity/schemaTypes/index.ts`**

```ts
import type { SchemaTypeDefinition } from "sanity";

import siteSettings from "./siteSettings";
import aboutSection from "./aboutSection";
import skillsSection from "./skillsSection";
import experienceSection from "./experienceSection";
import projectsSection from "./projectsSection";
import contactSection from "./contactSection";
import experience from "./experience";
import project from "./project";
import skill from "./skill";
import certification from "./certification";
import social from "./social";

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  aboutSection,
  skillsSection,
  experienceSection,
  projectsSection,
  contactSection,
  experience,
  project,
  skill,
  certification,
  social,
];
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit sanity/schemaTypes/index.ts`
Expected: no output (Task 1's `sanity.config.ts` import error from Step 4 should now be resolved too — rerun `npx tsc --noEmit sanity.config.ts` and expect only the still-missing `sanity/structure` error until Task 3).

---

### Task 3: Define desk structure and pin singletons

**Files:**
- Create: `sanity/structure.ts`

**Interfaces:**
- Consumes: schema type names from Task 2 (`siteSettings`, `aboutSection`, `skillsSection`, `experienceSection`, `projectsSection`, `contactSection`).
- Produces: `structure: StructureResolver` — consumed by `sanity.config.ts` (Task 1, Step 4).

- [ ] **Step 1: Create `sanity/structure.ts`**

```ts
import type { StructureResolver } from "sanity/structure";

const SINGLETONS: { id: string; title: string }[] = [
  { id: "siteSettings", title: "Site Settings" },
  { id: "aboutSection", title: "About Section" },
  { id: "skillsSection", title: "Skills Section" },
  { id: "experienceSection", title: "Experience Section" },
  { id: "projectsSection", title: "Projects Section" },
  { id: "contactSection", title: "Contact Section" },
];

const SINGLETON_TYPE_IDS = new Set(SINGLETONS.map((s) => s.id));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      ...SINGLETONS.map(({ id, title }) =>
        S.listItem()
          .id(id)
          .title(title)
          .child(S.document().schemaType(id).documentId(id))
      ),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return id !== undefined && !SINGLETON_TYPE_IDS.has(id);
      }),
    ]);
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit sanity.config.ts sanity/structure.ts`
Expected: no output.

---

### Task 4: Embed Studio at `/studio` and allow Sanity's image CDN

**Files:**
- Create: `app/studio/[[...tool]]/page.tsx`
- Create: `app/studio/[[...tool]]/StudioClient.tsx`
- Create: `vercel.json`
- Modify: `next.config.mjs`

**Interfaces:**
- Consumes: default export of `sanity.config.ts` (Task 1).

- [ ] **Step 1: Create the Studio client component**

`app/studio/[[...tool]]/StudioClient.tsx`:

```tsx
"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export default function StudioClient() {
  return <NextStudio config={config} />;
}
```

- [ ] **Step 2: Create the Studio page (server component wrapper)**

`app/studio/[[...tool]]/page.tsx`:

```tsx
import type { Metadata } from "next";
import StudioClient from "./StudioClient";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ tool: [] }];
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <StudioClient />;
}
```

(`generateStaticParams`/`metadata` must live in a server component — that's why this is split from `StudioClient.tsx`, which is `"use client"`.)

- [ ] **Step 3: Add a Vercel rewrite so deep Studio links resolve**

With `output: 'export'`, only one static file is generated for the `[[...tool]]` catch-all (per `generateStaticParams` above). Studio's own client-side router handles in-app navigation fine after that file loads, but a hard refresh on e.g. `/studio/desk/project;xyz` would 404 without this rewrite.

Create `vercel.json` (repo root):

```json
{
  "rewrites": [
    { "source": "/studio/:path*", "destination": "/studio" }
  ]
}
```

- [ ] **Step 4: Allow Sanity's image CDN in `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
};

export default nextConfig;
```

- [ ] **Step 5: Verify**

Run: `npm run dev` (in a separate terminal), then visit `http://localhost:3000/studio`.
Expected: Sanity Studio's login screen loads (it will show a "no schema" or auth prompt if `.env.local` values from Task 1 aren't fully configured yet — that's fine at this point; the goal is confirming the route renders instead of 404ing or crashing). Stop the dev server when done.

---

### Task 5: Extend `lib/content.ts` with the six section-copy getters and seed fallback YAML

**Files:**
- Modify: `lib/content.ts`
- Create: `content/site-settings.yaml`
- Create: `content/sections/about.yaml`
- Create: `content/sections/skills.yaml`
- Create: `content/sections/experience.yaml`
- Create: `content/sections/projects.yaml`
- Create: `content/sections/contact.yaml`

**Interfaces:**
- Produces: `getSiteSettings(): SiteSettings`, `getAboutSection(): AboutSectionContent`, `getSkillsSection(): SkillsSectionContent`, `getExperienceSection(): ExperienceSectionContent`, `getProjectsSection(): ProjectsSectionContent`, `getContactSection(): ContactSectionContent` — consumed by `app/page.tsx` and the components in Task 6.

- [ ] **Step 1: Add the six schemas and a `readYamlFile` helper to `lib/content.ts`**

Insert after the existing `readYamlDir` function (`lib/content.ts:8-21`):

```ts
function readYamlFile<T>(relativePath: string, schema: z.ZodType<T, z.ZodTypeDef, any>): T {
  const filePath = path.join(contentDir, relativePath);
  const raw = fs.readFileSync(filePath, "utf-8");
  return schema.parse(yaml.load(raw));
}
```

Insert after the existing `CertificationSchema`/`Certification` export (`lib/content.ts:68-76`):

```ts
const SiteSettingsSchema = z.object({
  name: z.string(),
  roles: z.array(z.string()).default([]),
  heroHeadline: z.string(),
  heroSubtext: z.string(),
  footerCta: z.string(),
});
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;

const AboutSectionSchema = z.object({
  eyebrow: z.string(),
  headline: z.string(),
  paragraphs: z.array(z.string()).default([]),
  expertiseLabel: z.string(),
  tagline: z.string(),
});
export type AboutSectionContent = z.infer<typeof AboutSectionSchema>;

const SkillsSectionSchema = z.object({
  eyebrow: z.string(),
  headline: z.string(),
});
export type SkillsSectionContent = z.infer<typeof SkillsSectionSchema>;

const ExperienceSectionSchema = z.object({ eyebrow: z.string() });
export type ExperienceSectionContent = z.infer<typeof ExperienceSectionSchema>;

const ProjectsSectionSchema = z.object({ eyebrow: z.string() });
export type ProjectsSectionContent = z.infer<typeof ProjectsSectionSchema>;

const ContactSectionSchema = z.object({ eyebrow: z.string() });
export type ContactSectionContent = z.infer<typeof ContactSectionSchema>;
```

- [ ] **Step 2: Add the six getters at the end of `lib/content.ts`**

Append after the existing `getCertifications` function:

```ts
export function getSiteSettings(): SiteSettings {
  return readYamlFile("site-settings.yaml", SiteSettingsSchema);
}

export function getAboutSection(): AboutSectionContent {
  return readYamlFile("sections/about.yaml", AboutSectionSchema);
}

export function getSkillsSection(): SkillsSectionContent {
  return readYamlFile("sections/skills.yaml", SkillsSectionSchema);
}

export function getExperienceSection(): ExperienceSectionContent {
  return readYamlFile("sections/experience.yaml", ExperienceSectionSchema);
}

export function getProjectsSection(): ProjectsSectionContent {
  return readYamlFile("sections/projects.yaml", ProjectsSectionSchema);
}

export function getContactSection(): ContactSectionContent {
  return readYamlFile("sections/contact.yaml", ContactSectionSchema);
}
```

- [ ] **Step 3: Seed the fallback YAML files with the copy currently hardcoded in components**

`content/site-settings.yaml`:

```yaml
name: "Waleed Ahmed"
roles:
  - "Software Engineer"
  - "Product Builder"
  - "Content Creator"
  - "Full Stack Developer"
heroHeadline: "Building software people actually enjoy using."
heroSubtext: "Currently building things from Karachi."
footerCta: "Let's build something together"
```

`content/sections/about.yaml`:

```yaml
eyebrow: "About"
headline: "I've always been fascinated by products that feel effortless."
paragraphs:
  - "The kind people recommend without thinking. That's what I enjoy building: software that disappears into the task, and design that earns trust in the first three seconds."
  - "I work across the stack, but I spend most of my attention on the parts people actually feel: pacing, hierarchy, the half-second before something responds."
expertiseLabel: "Currently working with"
tagline: "still learning."
```

`content/sections/skills.yaml`:

```yaml
eyebrow: "Skills"
headline: "Tools I reach for, and the credentials behind them."
```

`content/sections/experience.yaml`:

```yaml
eyebrow: "Experience"
```

`content/sections/projects.yaml`:

```yaml
eyebrow: "Selected work"
```

`content/sections/contact.yaml`:

```yaml
eyebrow: "Contact"
```

- [ ] **Step 4: Verify**

Run:
```bash
npx tsx -e "
import { getSiteSettings, getAboutSection, getSkillsSection, getExperienceSection, getProjectsSection, getContactSection } from './lib/content';
console.log(getSiteSettings());
console.log(getAboutSection());
console.log(getSkillsSection());
console.log(getExperienceSection());
console.log(getProjectsSection());
console.log(getContactSection());
"
```
Expected: six objects printed, no thrown errors, matching the YAML above.

---

### Task 6: Wire section copy into components

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/Hero.tsx`
- Modify: `components/About.tsx`
- Modify: `components/Skills.tsx`
- Modify: `components/Experience.tsx`
- Modify: `components/ExperienceTimeline.tsx`
- Modify: `components/Projects.tsx`
- Modify: `components/Footer.tsx`

**Interfaces:**
- Consumes: `getSiteSettings`, `getAboutSection`, `getSkillsSection`, `getExperienceSection`, `getProjectsSection`, `getContactSection` from Task 5.

- [ ] **Step 1: Update `app/page.tsx` to load and pass the new section content**

Replace `app/page.tsx` in full:

```tsx
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Process from "@/components/Process";
import Footer from "@/components/Footer";
import InteractiveBackground from "@/components/InteractiveBackground";
import {
  getCertifications,
  getProjects,
  getSkills,
  getSocials,
  getSiteSettings,
  getAboutSection,
  getSkillsSection,
  getProjectsSection,
  getContactSection,
} from "@/lib/content";

export default function Home() {
  const projects = getProjects();
  const socials = getSocials();
  const skills = getSkills();
  const certifications = getCertifications();
  const resumeHref = socials.find((s) => s.label === "Resume")?.href;
  const siteSettings = getSiteSettings();
  const aboutSection = getAboutSection();
  const skillsSection = getSkillsSection();
  const projectsSection = getProjectsSection();
  const contactSection = getContactSection();

  return (
    <main className="relative">
      <InteractiveBackground />
      <Nav resumeHref={resumeHref} />
      <Hero settings={siteSettings} />
      <div className="hairline relative z-10 mx-6 text-ink/40 dark:text-dark-text/40 md:mx-12" />
      <About skills={skills} content={aboutSection} />
      <div className="hairline relative z-10 mx-6 text-ink/40 dark:text-dark-text/40 md:mx-12" />
      <Experience />
      <div className="hairline relative z-10 mx-6 text-ink/40 dark:text-dark-text/40 md:mx-12" />
      <Projects projects={projects} eyebrow={projectsSection.eyebrow} />
      <div className="hairline relative z-10 mx-6 text-ink/40 dark:text-dark-text/40 md:mx-12" />
      <Skills skills={skills} certifications={certifications} content={skillsSection} />
      <div className="hairline relative z-10 mx-6 text-ink/40 dark:text-dark-text/40 md:mx-12" />
      <Process />
      <Footer socials={socials} eyebrow={contactSection.eyebrow} cta={siteSettings.footerCta} />
    </main>
  );
}
```

- [ ] **Step 2: Update `components/Hero.tsx` to take `settings` instead of hardcoded copy**

Replace lines `components/Hero.tsx:1-17` (imports through the `roleIndex` effect) with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import type { SiteSettings } from "@/lib/content";

export default function Hero({ settings }: { settings: SiteSettings }) {
  const { name, roles, heroHeadline, heroSubtext } = settings;
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    if (roles.length === 0) return;
    const interval = setInterval(() => {
      setRoleIndex((i) => (i + 1) % roles.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [roles.length]);
```

Then in the JSX body (`components/Hero.tsx:24-41` and `65`), swap the four hardcoded strings for the destructured variables:
- `Waleed Ahmed` (line 31) → `{name}`
- `Building software people actually enjoy using.` (line 40) → `{heroHeadline}`
- `{roles[roleIndex]}` (lines 46, 53) — unchanged, already reads from the local `roles` array which now comes from `settings.roles`
- `Currently building things from Karachi.` (line 66) → `{heroSubtext}`

- [ ] **Step 3: Update `components/About.tsx` to take `content` instead of hardcoded copy**

Change the function signature (`components/About.tsx:9`):

```tsx
import type { AboutSectionContent, Skill } from "@/lib/content";

export default function About({ skills, content }: { skills: Skill[]; content: AboutSectionContent }) {
  const badges = skills.filter((s) => s.expertise);
```

Replace the eyebrow span (`components/About.tsx:17-19`):

```tsx
            <span className="text-md uppercase tracking-wide text-ink-soft dark:text-dark-soft">
              {content.eyebrow}
            </span>
```

Replace the headline paragraph (`components/About.tsx:25-27`):

```tsx
            <p className="text-balance font-display text-3xl leading-[1.2] tracking-tightest2 text-ink dark:text-dark-text md:text-5xl">
              {content.headline}
            </p>
```

Replace the two hardcoded body `<Reveal>` blocks (`components/About.tsx:30-44`) with a `.map()` over `content.paragraphs`:

```tsx
          {content.paragraphs.map((paragraph, i) => (
            <Reveal key={paragraph} delay={0.15 + i * 0.1}>
              <p className="mt-8 max-w-xl text-balance text-xl leading-[1.75] text-ink-soft dark:text-dark-soft first:mt-8 [&:not(:first-child)]:mt-6">
                {paragraph}
              </p>
            </Reveal>
          ))}
```

Replace the "Currently working with" label (`components/About.tsx:48-50`):

```tsx
              <span className="text-xs uppercase tracking-widest2 text-ink-soft/70 dark:text-dark-soft/70">
                {content.expertiseLabel}
              </span>
```

Replace the tagline (`components/About.tsx:115`):

```tsx
              <span className="font-note italic">{content.tagline}</span>
```

- [ ] **Step 4: Update `components/Skills.tsx` to take `content` instead of hardcoded copy**

Change the function signature (`components/Skills.tsx:10-16`):

```tsx
import type { Certification, Skill, SkillsSectionContent } from "@/lib/content";

export default function Skills({
  skills,
  certifications,
  content,
}: {
  skills: Skill[];
  certifications: Certification[];
  content: SkillsSectionContent;
}) {
```

Replace the eyebrow and headline (`components/Skills.tsx:22-33`):

```tsx
      <Reveal>
        <span className="text-md uppercase tracking-wide text-ink-soft dark:text-dark-soft">
          {content.eyebrow}
        </span>
      </Reveal>

      <Reveal delay={0.05}>
        <p className="text-balance mt-6 font-display text-3xl leading-[1.2] tracking-tightest2 text-ink dark:text-dark-text md:text-5xl">
          {content.headline}
        </p>
      </Reveal>
```

- [ ] **Step 5: Update `components/Experience.tsx` and `components/ExperienceTimeline.tsx` to take the section eyebrow**

Replace `components/Experience.tsx` in full:

```tsx
import { getExperiences, getExperienceSection } from "@/lib/content";
import ExperienceTimeline from "./ExperienceTimeline";

export default function Experience() {
  const experiences = getExperiences();
  const section = getExperienceSection();
  return <ExperienceTimeline experiences={experiences} eyebrow={section.eyebrow} />;
}
```

Change the function signature (`components/ExperienceTimeline.tsx:10`):

```tsx
export default function ExperienceTimeline({
  experiences,
  eyebrow,
}: {
  experiences: Experience[];
  eyebrow: string;
}) {
```

Replace the hardcoded label (`components/ExperienceTimeline.tsx:28-30`):

```tsx
        <span className="text-md uppercase tracking-wide text-ink-soft dark:text-dark-soft">
          {eyebrow}
        </span>
```

- [ ] **Step 6: Update `components/Projects.tsx` to take `eyebrow`**

Change the function signature (`components/Projects.tsx:61`):

```tsx
export default function Projects({ projects, eyebrow }: { projects: Project[]; eyebrow: string }) {
```

Replace the hardcoded label (`components/Projects.tsx:100-102`):

```tsx
          <span className="text-md uppercase tracking-wide text-ink-soft dark:text-dark-soft">
            {eyebrow}
          </span>
```

- [ ] **Step 7: Update `components/Footer.tsx` to take `eyebrow` and `cta`**

Change the function signature (`components/Footer.tsx:34`):

```tsx
export default function Footer({
  socials,
  eyebrow,
  cta,
}: {
  socials: Social[];
  eyebrow: string;
  cta: string;
}) {
```

Replace the hardcoded label (`components/Footer.tsx:70-72`):

```tsx
          <span className="text-md uppercase tracking-wide text-ink-soft dark:text-dark-soft md:self-center">
            {eyebrow}
          </span>
```

Replace the hardcoded CTA text (`components/Footer.tsx:135`, keep the `<ArrowUpRight>` sibling untouched):

```tsx
            {cta}
```

- [ ] **Step 8: Verify**

Run: `npm run build`
Expected: build succeeds (this runs the real Next static export, exercising every component change above against the seeded YAML from Task 5). If it fails, the error will point at a prop/type mismatch — fix before continuing.

---

### Task 7: Write the Sanity client helper and the sync script

**Files:**
- Create: `scripts/sanityClient.ts`
- Create: `scripts/sync-sanity.ts`

**Interfaces:**
- Produces: `createSanityClient(token: string | undefined): SanityClient` — consumed by `scripts/sync-sanity.ts` and `scripts/migrate-to-sanity.ts` (Task 8).

- [ ] **Step 1: Create `scripts/sanityClient.ts`**

```ts
import { createClient, type SanityClient } from "@sanity/client";

export function createSanityClient(token: string | undefined): SanityClient {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!projectId || !dataset) {
    throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
  }
  return createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  });
}
```

- [ ] **Step 2: Create `scripts/sync-sanity.ts`**

```ts
import "dotenv/config";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { createSanityClient } from "./sanityClient";

const contentDir = path.join(process.cwd(), "content");

type AnyDoc = Record<string, any>;

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function readExistingProjectImage(order: number): string | undefined {
  const dirPath = path.join(contentDir, "projects");
  if (!fs.existsSync(dirPath)) return undefined;
  for (const f of fs.readdirSync(dirPath).filter((f) => f.endsWith(".yaml"))) {
    const doc = yaml.load(fs.readFileSync(path.join(dirPath, f), "utf-8")) as AnyDoc;
    if (doc.order === order) return doc.image;
  }
  return undefined;
}

function replaceDirectory(dirName: string, entries: Array<{ file: string; contents: string }>) {
  const dirPath = path.join(contentDir, dirName);
  fs.mkdirSync(dirPath, { recursive: true });
  for (const f of fs.readdirSync(dirPath).filter((f) => f.endsWith(".yaml"))) {
    fs.unlinkSync(path.join(dirPath, f));
  }
  for (const { file, contents } of entries) {
    fs.writeFileSync(path.join(contentDir, file), contents, "utf-8");
  }
}

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_READ_TOKEN;

  if (!projectId || !dataset || !token) {
    console.warn(
      "[sync-sanity] Skipping: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or SANITY_READ_TOKEN is not set. Keeping existing content/*.yaml as-is."
    );
    return;
  }

  const client = createSanityClient(token);
  const builder = imageUrlBuilder(client);
  const urlFor = (source: SanityImageSource) => builder.image(source).url();

  const [
    siteSettings,
    aboutSection,
    skillsSection,
    experienceSection,
    projectsSection,
    contactSection,
    experiences,
    projects,
    skills,
    certifications,
    socials,
  ] = await Promise.all([
    client.fetch<AnyDoc | null>('*[_type == "siteSettings"][0]'),
    client.fetch<AnyDoc | null>('*[_type == "aboutSection"][0]'),
    client.fetch<AnyDoc | null>('*[_type == "skillsSection"][0]'),
    client.fetch<AnyDoc | null>('*[_type == "experienceSection"][0]'),
    client.fetch<AnyDoc | null>('*[_type == "projectsSection"][0]'),
    client.fetch<AnyDoc | null>('*[_type == "contactSection"][0]'),
    client.fetch<AnyDoc[]>('*[_type == "experience"] | order(order asc)'),
    client.fetch<AnyDoc[]>('*[_type == "project"] | order(order asc)'),
    client.fetch<AnyDoc[]>('*[_type == "skill"] | order(order asc)'),
    client.fetch<AnyDoc[]>('*[_type == "certification"] | order(order asc)'),
    client.fetch<AnyDoc[]>('*[_type == "social"]'),
  ]);

  const requiredSingletons: Array<[string, AnyDoc | null]> = [
    ["siteSettings", siteSettings],
    ["aboutSection", aboutSection],
    ["skillsSection", skillsSection],
    ["experienceSection", experienceSection],
    ["projectsSection", projectsSection],
    ["contactSection", contactSection],
  ];
  const missing = requiredSingletons.filter(([, doc]) => !doc).map(([name]) => name);
  if (missing.length > 0) {
    console.error(
      `[sync-sanity] Aborting: missing singleton document(s) in Sanity: ${missing.join(
        ", "
      )}. Run "npm run migrate-to-sanity" once to seed them.`
    );
    process.exit(1);
  }

  const flatFiles: Array<{ file: string; contents: string }> = [
    {
      file: "site-settings.yaml",
      contents: yaml.dump({
        name: siteSettings!.name,
        roles: siteSettings!.roles ?? [],
        heroHeadline: siteSettings!.heroHeadline,
        heroSubtext: siteSettings!.heroSubtext,
        footerCta: siteSettings!.footerCta,
      }),
    },
    {
      file: "sections/about.yaml",
      contents: yaml.dump({
        eyebrow: aboutSection!.eyebrow,
        headline: aboutSection!.headline,
        paragraphs: aboutSection!.paragraphs ?? [],
        expertiseLabel: aboutSection!.expertiseLabel,
        tagline: aboutSection!.tagline,
      }),
    },
    {
      file: "sections/skills.yaml",
      contents: yaml.dump({ eyebrow: skillsSection!.eyebrow, headline: skillsSection!.headline }),
    },
    { file: "sections/experience.yaml", contents: yaml.dump({ eyebrow: experienceSection!.eyebrow }) },
    { file: "sections/projects.yaml", contents: yaml.dump({ eyebrow: projectsSection!.eyebrow }) },
    { file: "sections/contact.yaml", contents: yaml.dump({ eyebrow: contactSection!.eyebrow }) },
    {
      file: "skills.yaml",
      contents: yaml.dump(
        skills.map((s) => ({
          order: s.order ?? 0,
          name: s.name,
          category: s.category ?? "General",
          icon: s.icon ?? "sparkle",
          expertise: Boolean(s.expertise),
        }))
      ),
    },
    {
      file: "certifications.yaml",
      contents: yaml.dump(
        certifications.map((c) => ({
          order: c.order ?? 0,
          title: c.title,
          issuer: c.issuer,
          date: c.date,
          credentialUrl: c.credentialUrl,
          icon: c.icon ?? "award",
        }))
      ),
    },
    {
      file: "socials.yaml",
      contents: yaml.dump(socials.map((s) => ({ label: s.label, href: s.href, icon: s.icon }))),
    },
  ];

  const experienceFiles = experiences.map((exp) => ({
    file: `experiences/${pad(exp.order ?? 0)}-${slugify(exp.title)}.yaml`,
    contents: yaml.dump({
      order: exp.order,
      chapter: exp.chapter,
      title: exp.title,
      date: exp.date,
      description: exp.description,
      technologies: exp.technologies ?? [],
      featured: Boolean(exp.featured),
    }),
  }));

  const projectFiles = projects.map((proj) => ({
    file: `projects/${pad(proj.order ?? 0)}-${slugify(proj.title)}.yaml`,
    contents: yaml.dump({
      order: proj.order,
      image: proj.image ? urlFor(proj.image) : readExistingProjectImage(proj.order) ?? "",
      status: proj.status,
      title: proj.title,
      description: proj.description,
      role: proj.role,
      stack: proj.stack ?? [],
      outcome: proj.outcome,
      links: {
        visit: proj.links?.visit ?? "",
        github: proj.links?.github ?? "",
        caseStudy: proj.links?.caseStudy ?? "",
      },
      featured: Boolean(proj.featured),
    }),
  }));

  for (const { file, contents } of flatFiles) {
    const target = path.join(contentDir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents, "utf-8");
  }
  replaceDirectory("experiences", experienceFiles);
  replaceDirectory("projects", projectFiles);

  console.log(
    `[sync-sanity] Wrote ${flatFiles.length + experienceFiles.length + projectFiles.length} file(s) to content/.`
  );
}

main().catch((err) => {
  console.error("[sync-sanity] Failed:", err);
  process.exit(1);
});
```

- [ ] **Step 3: Verify (without real credentials yet)**

Run: `npx tsx scripts/sync-sanity.ts`
Expected (since `.env.local` tokens are still blank from Task 1): a `[sync-sanity] Skipping: ...` warning is printed, the process exits 0, and `content/*.yaml` is unchanged. Confirm with `git status` that nothing under `content/` was modified.

---

### Task 8: Write the one-time migration script

**Files:**
- Create: `scripts/migrate-to-sanity.ts`

**Interfaces:**
- Consumes: `createSanityClient` from Task 7.

- [ ] **Step 1: Create `scripts/migrate-to-sanity.ts`**

```ts
import "dotenv/config";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { createSanityClient } from "./sanityClient";

const contentDir = path.join(process.cwd(), "content");

const SINGLETONS: Record<string, Record<string, unknown>> = {
  siteSettings: {
    _type: "siteSettings",
    name: "Waleed Ahmed",
    roles: ["Software Engineer", "Product Builder", "Content Creator", "Full Stack Developer"],
    heroHeadline: "Building software people actually enjoy using.",
    heroSubtext: "Currently building things from Karachi.",
    footerCta: "Let's build something together",
  },
  aboutSection: {
    _type: "aboutSection",
    eyebrow: "About",
    headline: "I've always been fascinated by products that feel effortless.",
    paragraphs: [
      "The kind people recommend without thinking. That's what I enjoy building: software that disappears into the task, and design that earns trust in the first three seconds.",
      "I work across the stack, but I spend most of my attention on the parts people actually feel: pacing, hierarchy, the half-second before something responds.",
    ],
    expertiseLabel: "Currently working with",
    tagline: "still learning.",
  },
  skillsSection: {
    _type: "skillsSection",
    eyebrow: "Skills",
    headline: "Tools I reach for, and the credentials behind them.",
  },
  experienceSection: { _type: "experienceSection", eyebrow: "Experience" },
  projectsSection: { _type: "projectsSection", eyebrow: "Selected work" },
  contactSection: { _type: "contactSection", eyebrow: "Contact" },
};

function loadYamlDir(dirName: string): Array<Record<string, any>> {
  const dirPath = path.join(contentDir, dirName);
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => yaml.load(fs.readFileSync(path.join(dirPath, f), "utf-8")) as Record<string, any>);
}

function loadYamlFile(fileName: string): any {
  return yaml.load(fs.readFileSync(path.join(contentDir, fileName), "utf-8"));
}

async function main() {
  const token = process.env.SANITY_WRITE_TOKEN;
  if (!token) {
    console.error("[migrate-to-sanity] SANITY_WRITE_TOKEN is required.");
    process.exit(1);
  }
  const client = createSanityClient(token);

  for (const [id, doc] of Object.entries(SINGLETONS)) {
    await client.createOrReplace({ _id: id, ...doc });
    console.log(`[migrate-to-sanity] Upserted singleton "${id}"`);
  }

  for (const exp of loadYamlDir("experiences")) {
    const id = `experience-${String(exp.order).padStart(2, "0")}`;
    await client.createOrReplace({ _id: id, _type: "experience", ...exp });
    console.log(`[migrate-to-sanity] Upserted experience "${exp.title}"`);
  }

  for (const proj of loadYamlDir("projects")) {
    const id = `project-${String(proj.order).padStart(2, "0")}`;
    const { image, ...rest } = proj;
    await client.createOrReplace({ _id: id, _type: "project", ...rest });
    console.log(
      `[migrate-to-sanity] Upserted project "${proj.title}" — its image field is empty; upload "${image}" manually in Studio`
    );
  }

  const skills = loadYamlFile("skills.yaml") as any[];
  for (const skill of skills) {
    const id = `skill-${String(skill.order).padStart(2, "0")}`;
    await client.createOrReplace({ _id: id, _type: "skill", ...skill });
  }
  console.log(`[migrate-to-sanity] Upserted ${skills.length} skill(s)`);

  const certifications = loadYamlFile("certifications.yaml") as any[];
  for (const cert of certifications) {
    const id = `certification-${String(cert.order).padStart(2, "0")}`;
    await client.createOrReplace({ _id: id, _type: "certification", ...cert });
  }
  console.log(`[migrate-to-sanity] Upserted ${certifications.length} certification(s)`);

  const socials = loadYamlFile("socials.yaml") as any[];
  for (const [i, social] of socials.entries()) {
    const id = `social-${String(i).padStart(2, "0")}`;
    await client.createOrReplace({ _id: id, _type: "social", ...social });
  }
  console.log(`[migrate-to-sanity] Upserted ${socials.length} social(s)`);
}

main().catch((err) => {
  console.error("[migrate-to-sanity] Failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Verify script compiles (do not run yet — no write token configured until Task 9)**

Run: `npx tsc --noEmit scripts/migrate-to-sanity.ts scripts/sync-sanity.ts scripts/sanityClient.ts`
Expected: no output.

---

### Task 9: Generate Sanity tokens, run the migration, and verify the full loop end-to-end

**Files:** none created — this task operates `.env.local` (from Task 1) and Sanity's dashboard.

- [ ] **Step 1: Create API tokens in sanity.io/manage**

In https://sanity.io/manage → project `qevudxof` → API → Tokens:
- Create a token named "portfolio-read" with **Viewer** permissions. Put its value in `.env.local` as `SANITY_READ_TOKEN`.
- Create a token named "portfolio-write" with **Editor** permissions. Put its value in `.env.local` as `SANITY_WRITE_TOKEN`. This one is used only locally for the one-time migration — never set it in Vercel's env vars.

- [ ] **Step 2: Run the one-time migration**

Run: `npm run migrate-to-sanity`
Expected: a log line per singleton/document upserted, ending in the counts for skills/certifications/socials, with no errors.

- [ ] **Step 3: Manually upload project images in Studio**

Run: `npm run dev`, visit `http://localhost:3000/studio`, log in with your Sanity account. For each Project document, open it and upload the corresponding image from `public/images/projects/` into the now-empty `image` field (the migration log from Step 2 named which local path belongs to which project). Publish each document. Stop the dev server when done.

- [ ] **Step 4: Run the sync script against real data**

Run: `npm run sync-sanity`
Expected: `[sync-sanity] Wrote N file(s) to content/.` — inspect `git diff content/` and confirm the regenerated YAML matches what's in Studio (same experiences, projects now pointing at `https://cdn.sanity.io/...` image URLs, same skills/certifications/socials, and the six section-copy files matching what you saw in Studio).

- [ ] **Step 5: Run a full production build**

Run: `npm run build`
Expected: `prebuild` runs `sync-sanity` automatically, then `next build` succeeds and produces the static export in `out/`.

- [ ] **Step 6: Edit something in Studio and confirm it flows through**

In Studio, change one section's eyebrow text (e.g. Skills' eyebrow) and publish. Run `npm run sync-sanity` again and check that `content/sections/skills.yaml` picked up the new value.

- [ ] **Step 7: Set up the Vercel webhook (production-only step — confirm with the user before touching live deployment settings)**

In Vercel project settings → Git → Deploy Hooks, create a hook (e.g. "sanity-publish") and copy its URL. In sanity.io/manage → project → API → Webhooks, create a webhook pointed at that URL, triggered on Create/Update/Delete for all document types, so publishing in Studio triggers a redeploy. Add `SANITY_READ_TOKEN`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, and `NEXT_PUBLIC_SANITY_DATASET` to Vercel's project environment variables (do **not** add `SANITY_WRITE_TOKEN` there).

This plan does not perform Step 7 automatically — it touches live infrastructure outside the repo and should be confirmed with the user first.
