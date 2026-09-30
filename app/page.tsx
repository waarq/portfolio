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
