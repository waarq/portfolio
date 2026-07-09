import { getExperiences } from "@/lib/content";
import ExperienceTimeline from "./ExperienceTimeline";

export default function Experience() {
  const experiences = getExperiences();
  return <ExperienceTimeline experiences={experiences} />;
}
