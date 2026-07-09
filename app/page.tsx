import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Process from "@/components/Process";
import Footer from "@/components/Footer";
import { getCertifications, getProjects, getSkills, getSocials } from "@/lib/content";

const InteractiveBackground = dynamic(() => import("@/components/InteractiveBackground"), {
  ssr: false,
});

export default function Home() {
  const projects = getProjects();
  const socials = getSocials();
  const skills = getSkills();
  const certifications = getCertifications();

  return (
    <main className="relative">
      <InteractiveBackground />
      <Nav />
      <Hero />
      <div className="hairline relative z-10 mx-6 text-ink/40 dark:text-dark-text/40 md:mx-12" />
      <About skills={skills} />
      <div className="hairline relative z-10 mx-6 text-ink/40 dark:text-dark-text/40 md:mx-12" />
      <Experience />
      <div className="hairline relative z-10 mx-6 text-ink/40 dark:text-dark-text/40 md:mx-12" />
      <Projects projects={projects} />
      <div className="hairline relative z-10 mx-6 text-ink/40 dark:text-dark-text/40 md:mx-12" />
      <Skills skills={skills} certifications={certifications} />
      <div className="hairline relative z-10 mx-6 text-ink/40 dark:text-dark-text/40 md:mx-12" />
      <Process />
      <Footer socials={socials} />
    </main>
  );
}
