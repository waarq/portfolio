import { config } from "dotenv";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { createSanityClient } from "./sanityClient";

config({ path: path.join(process.cwd(), ".env.local") });

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
