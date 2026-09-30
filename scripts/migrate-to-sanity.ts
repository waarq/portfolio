import { config } from "dotenv";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { createSanityClient } from "./sanityClient";

config({ path: path.join(process.cwd(), ".env.local") });

const contentDir = path.join(process.cwd(), "content");

const SINGLETONS: Record<string, { _type: string; [key: string]: unknown }> = {
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
    await client.createOrReplace({ ...exp, _id: id, _type: "experience" });
    console.log(`[migrate-to-sanity] Upserted experience "${exp.title}"`);
  }

  for (const proj of loadYamlDir("projects")) {
    const id = `project-${String(proj.order).padStart(2, "0")}`;
    const { image, ...rest } = proj;
    await client.createOrReplace({ ...rest, _id: id, _type: "project" });
    console.log(
      `[migrate-to-sanity] Upserted project "${proj.title}" — its image field is empty; upload "${image}" manually in Studio`
    );
  }

  const skills = loadYamlFile("skills.yaml") as any[];
  for (const skill of skills) {
    const id = `skill-${String(skill.order).padStart(2, "0")}`;
    await client.createOrReplace({ ...skill, _id: id, _type: "skill" });
  }
  console.log(`[migrate-to-sanity] Upserted ${skills.length} skill(s)`);

  const certifications = loadYamlFile("certifications.yaml") as any[];
  for (const cert of certifications) {
    const id = `certification-${String(cert.order).padStart(2, "0")}`;
    await client.createOrReplace({ ...cert, _id: id, _type: "certification" });
  }
  console.log(`[migrate-to-sanity] Upserted ${certifications.length} certification(s)`);

  const socials = loadYamlFile("socials.yaml") as any[];
  for (const [i, social] of socials.entries()) {
    const id = `social-${String(i).padStart(2, "0")}`;
    await client.createOrReplace({ ...social, _id: id, _type: "social" });
  }
  console.log(`[migrate-to-sanity] Upserted ${socials.length} social(s)`);
}

main().catch((err) => {
  console.error("[migrate-to-sanity] Failed:", err);
  process.exit(1);
});
