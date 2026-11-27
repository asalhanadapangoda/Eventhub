import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectDetails } from '../components/ProjectDetails';
import { projects as staticProjects } from '../data/projects';
import { cachedFetchJson } from '../../../common/apiCache';

export function ProjectPage() {
  const { slug } = useParams();
  const [projectsList, setProjectsList] = useState(staticProjects);

  useEffect(() => {
    cachedFetchJson('/api/settings/content/projects', { ttlMs: 120000 })
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const staticBySlug = new Map(staticProjects.map((p) => [p.slug, p]));
          const merged = res.data.map((item) => {
            const base = staticBySlug.get(item.slug) || {};
            return {
              ...base,
              ...item,
              image: item.image || base.image,
            };
          });
          setProjectsList(merged);
        }
      })
      .catch(() => {});
  }, []);

  const project = projectsList.find((item) => item.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = project
      ? `${project.name} | TRACE Sri Lanka`
      : 'Project Not Found | TRACE Sri Lanka';
  }, [slug, project]);

  return <ProjectDetails project={project} />;
}

