import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectDetails } from '../components/ProjectDetails';
import { projects } from '../data/projects';

export function ProjectPage() {
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = project
      ? `${project.name} | TRACE Sri Lanka`
      : 'Project Not Found | TRACE Sri Lanka';
  }, [slug, project]);

  return <ProjectDetails project={project} />;
}

