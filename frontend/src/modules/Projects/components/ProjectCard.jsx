import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.slug}`} className="project-card" aria-label={`View ${project.name}`}>
      <div
        className={`project-card-media ${project.imageFit === 'contain' ? 'is-contain' : ''}`}
        style={project.imageBg ? { backgroundColor: project.imageBg } : undefined}
      >
        <img
          src={project.image}
          alt={project.name}
          className="project-card-img"
          style={project.imagePosition ? { objectPosition: project.imagePosition } : undefined}
          loading="lazy"
        />
        <div className="project-card-overlay" />
        <span className="project-card-badge">{project.category}</span>
      </div>

      <div className="project-card-body">
        <h2 className="project-card-title">{project.name}</h2>
        <p className="project-card-desc">{project.shortDescription}</p>

        <div className="project-card-footer">
          <span className="view-project-link">
            <span>View Project</span>
            <ArrowRight size={17} className="view-project-arrow" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

