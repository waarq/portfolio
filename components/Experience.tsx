import { getExperiences, getExperienceSection } from "@/lib/content";
import ExperienceTimeline from "./ExperienceTimeline";

export default function Experience() {
  const experiences = getExperiences();
  const section = getExperienceSection();
  return <ExperienceTimeline experiences={experiences} eyebrow={section.eyebrow} />;
}
