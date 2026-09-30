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
