# Sanity CMS — How to Run This Stuff

Short, practical guide for editing portfolio content and pushing it live. No prior Sanity experience assumed.

## The mental model

- Content lives in **Sanity**, in two separate datasets: `development` and `production`.
- The site pulls content from Sanity **at build time only** (this is a static export — there's no live server). A script called `sync-sanity` writes Sanity's content into `content/*.yaml`, then `next build` reads those YAML files.
- Two Vercel deployments map to the two datasets:
  - `develop` branch → Preview deployment → reads from the `development` dataset
  - `main` branch → Production deployment → reads from the `production` dataset
- Editing content never touches this git repo directly. It's a separate flow: edit in Studio → preview → promote to prod.

## One-time setup (new machine / new dev)

1. Clone the repo, `npm install`.
2. Create `.env.local` in the repo root with:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=qevudxof
   NEXT_PUBLIC_SANITY_DATASET=development
   SANITY_READ_TOKEN=<ask a teammate / generate in sanity.io/manage>
   SANITY_WRITE_TOKEN=<ask a teammate / generate in sanity.io/manage>
   ```
   Tokens come from [sanity.io/manage](https://sanity.io/manage) → project `qevudxof` → API → Tokens. Never commit this file (it's gitignored).
3. Run `npm run dev` and open `http://localhost:3000` — should load fine using the fallback YAML already in git.

## Editing content day-to-day

1. Go to `<your-site>/studio` (or `localhost:3000/studio` locally) and log in with your Sanity account.
2. Make your edits (About, Skills, Experience, Projects, Contact, Site Settings, etc.) and hit **Publish**.
   - This writes to whichever dataset your Studio session is pointed at. In normal use, always edit in `development` first.
3. Sanity's webhook fires automatically → the `develop` Vercel deployment rebuilds → check the preview URL to confirm it looks right.
4. Happy with it? Promote it to production (see below). Not happy? Just keep editing `development` — nothing has touched prod yet.

## Promoting content to production

Once you've verified changes on the preview site, copy everything from `development` → `production`:

```bash
npm run promote-to-production
```

This copies **all** documents (not just what you changed) from `development` to `production`, and deletes anything in `production` that no longer exists in `development`. It then fires the production Sanity webhook → `main`'s Vercel deployment rebuilds → live site updates.

To go the other way (pull current prod content back into `development`, e.g. to reset your draft dataset):

```bash
npm run seed-development
```

## Checking things locally without deploying

Point `.env.local`'s `NEXT_PUBLIC_SANITY_DATASET` at whichever dataset you want to inspect (`development` or `production`), then:

```bash
npm run sync-sanity   # pulls that dataset into content/*.yaml
npm run dev            # view it at localhost:3000
```

`sync-sanity` also runs automatically before every `next build` (via the `prebuild` npm script) — that's what Vercel does on every deploy.

## Other scripts

| Command | What it does |
|---|---|
| `npm run sync-sanity` | Pulls the dataset in `.env.local` into `content/*.yaml`. Runs automatically before every build. |
| `npm run migrate-to-sanity` | One-time import of the original hand-written YAML into Sanity. You should never need to run this again — it's kept for reference/disaster recovery. |
| `npm run seed-development` | Copies `production` → `development`. |
| `npm run promote-to-production` | Copies `development` → `production`. |

## The YAML fallback

`content/*.yaml` is committed to git and is what the site falls back to if Sanity is ever unreachable or dropped entirely. It gets **overwritten** by `sync-sanity` at every build — don't hand-edit it expecting it to stick, and don't expect it to always match Sanity in the git history (it only reflects whatever was last synced on someone's machine or a Vercel build; the two can drift between real builds).

## Adding a new content field

1. Add the field to the relevant schema in `sanity/schemaTypes/*.ts`.
2. Add it to the matching zod schema + getter in `lib/content.ts`.
3. Add it to the sync logic in `scripts/sync-sanity.ts` (so it lands in YAML) and to `scripts/migrate-to-sanity.ts` if it needs a default/seed value.
4. Use it in the relevant component under `components/`.
5. Restart Studio (`/studio`) to see the new field in the editor.

## Gotchas

- If a build fails with "singletons missing from Sanity," it means one of the six required singleton documents (`siteSettings`, `aboutSection`, `skillsSection`, `experienceSection`, `projectsSection`, `contactSection`) doesn't exist in that dataset yet — create it once via Studio or `migrate-to-sanity`.
- `sync-sanity` silently no-ops (exits 0) if `SANITY_READ_TOKEN`/`SANITY_WRITE_TOKEN`/project ID aren't set — useful for CI environments that don't need live content, but means a missing `.env.local` won't show an obvious error locally either.
- Images: upload directly in Studio's `image` field for projects — it stores a Sanity CDN asset reference, resolved via `@sanity/image-url` at sync time.
