import { projects } from "../data/projects";
import ProjectCard from "../components/ProjectCard";
import ContactForm from "../components/ContactForm";

export default function Home() {
  return (
    <section className="home">
      <header className="home__header">
        <p className="home__eyebrow">Frontend developer and creative builder</p>
        <h1>Small ideas, shipped<br />as useful interfaces.</h1>
        <p>A collection of experiments, tools, and landing pages built with curiosity and care.</p>
      </header>

      <section id="work" className="home__section" aria-labelledby="work-title">
        <div className="section-heading">
          <p className="home__eyebrow">Selected work</p>
          <h2 id="work-title">A growing shelf of projects</h2>
          <span>{projects.length} live builds</span>
        </div>
        <div className="home__grid">
          {projects.map((project) => <ProjectCard key={project.slug} {...project} />)}
        </div>
      </section>

      <section id="about" className="home__section home__about" aria-labelledby="about-title">
        <p className="home__eyebrow">A little context</p>
        <h2 id="about-title">I like turning rough ideas into calm, clear experiences.</h2>
        <p>These projects are a hands-on record of learning by making: practical tools, playful music experiments, and responsive pages that are meant to be opened and used.</p>
      </section>

      <section id="contact" className="home__section home__contact" aria-labelledby="contact-title">
        <div className="home__contact-copy">
          <p className="home__eyebrow">Say hello</p>
          <h2 id="contact-title">Have a project in mind?</h2>
          <p>Send a note and I&apos;ll get back to you.</p>

          <div className="contact-links" aria-label="Connection apps">
            <a className="contact-link" href="https://github.com/adil-12-hassan" target="_blank" rel="noreferrer" aria-label="GitHub">
              <i className="fa-brands fa-github" aria-hidden="true" />
              <span>GitHub</span>
            </a>
            <a className="contact-link" href="https://www.linkedin.com/in/adil12hassan" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <i className="fa-brands fa-linkedin-in" aria-hidden="true" />
              <span>LinkedIn</span>
            </a>
            <a className="contact-link" href="https://instagram.com/adil12hassan" target="_blank" rel="noreferrer" aria-label="Instagram">
              <i className="fa-brands fa-instagram" aria-hidden="true" />
              <span>Instagram</span>
            </a>
            <a className="contact-link" href="https://maps.google.com/?q=Faisalabad%20Pakistan" target="_blank" rel="noreferrer" aria-label="Location">
              <i className="fa-solid fa-location-dot" aria-hidden="true" />
              <span>Location</span>
            </a>
            <a className="contact-link" href="tel:+923281511293" aria-label="Phone">
              <i className="fa-solid fa-phone" aria-hidden="true" />
              <span>Phone</span>
            </a>
          </div>
        </div>
        <ContactForm />
      </section>
    </section>
  );
}