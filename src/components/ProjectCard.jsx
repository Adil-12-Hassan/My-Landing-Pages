export default function ProjectCard({ title, description, path }) {
  return (
    <a
      href={path}
      className="project-card"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${title} project in a new tab`}
    >
      <h3 className="project-card__title">{title}</h3>
      <p className="project-card__description">{description}</p>
      <span className="project-card__link">View Project →</span>
    </a>
  )
}