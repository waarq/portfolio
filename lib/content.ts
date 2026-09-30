import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { z } from "zod";

const contentDir = path.join(process.cwd(), "content");

function readYamlDir<T>(dirName: string, schema: z.ZodType<T, z.ZodTypeDef, any>): T[] {
  const dirPath = path.join(contentDir, dirName);
  if (!fs.existsSync(dirPath)) return [];

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

  const items = files.map((file) => {
    const raw = fs.readFileSync(path.join(dirPath, file), "utf-8");
    const parsed = yaml.load(raw);
    return schema.parse(parsed);
  });

  return items.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
}

function readYamlFile<T>(relativePath: string, schema: z.ZodType<T, z.ZodTypeDef, any>): T {
  const filePath = path.join(contentDir, relativePath);
  const raw = fs.readFileSync(filePath, "utf-8");
  return schema.parse(yaml.load(raw));
}

const ExperienceSchema = z.object({
  order: z.number(),
  chapter: z.string(),
  title: z.string(),
  date: z.string(),
  description: z.string(),
  technologies: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});
export type Experience = z.infer<typeof ExperienceSchema>;

const ProjectSchema = z.object({
  order: z.number(),
  image: z.string(),
  status: z.string().optional(),
  title: z.string(),
  description: z.string(),
  role: z.string(),
  stack: z.array(z.string()).default([]),
  outcome: z.string(),
  links: z.object({
    visit: z.string().optional(),
    github: z.string().optional(),
    caseStudy: z.string().optional(),
  }),
  featured: z.boolean().default(false),
});
export type Project = z.infer<typeof ProjectSchema>;

const SocialSchema = z.object({
  label: z.string(),
  href: z.string(),
  icon: z.string(),
});
export type Social = z.infer<typeof SocialSchema>;

const SkillSchema = z.object({
  order: z.number().default(0),
  name: z.string(),
  category: z.string().default("General"),
  icon: z.string().default("sparkle"),
  expertise: z.boolean().default(false),
});
export type Skill = z.infer<typeof SkillSchema>;

const CertificationSchema = z.object({
  order: z.number().default(0),
  title: z.string(),
  issuer: z.string(),
  date: z.string(),
  credentialUrl: z.string().optional(),
  icon: z.string().default("award"),
});
export type Certification = z.infer<typeof CertificationSchema>;

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

export function getExperiences(): Experience[] {
  return readYamlDir("experiences", ExperienceSchema);
}

export function getProjects(): Project[] {
  return readYamlDir("projects", ProjectSchema);
}

export function getSocials(): Social[] {
  const filePath = path.join(contentDir, "socials.yaml");
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = yaml.load(raw);
  return z.array(SocialSchema).parse(parsed);
}

export function getSkills(): Skill[] {
  const filePath = path.join(contentDir, "skills.yaml");
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = yaml.load(raw);
  const list = z.array(SkillSchema).parse(parsed);
  return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getCertifications(): Certification[] {
  const filePath = path.join(contentDir, "certifications.yaml");
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = yaml.load(raw);
  const list = z.array(CertificationSchema).parse(parsed);
  return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

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
