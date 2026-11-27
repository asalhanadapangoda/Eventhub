import React, { useEffect, useMemo, useState } from 'react';
import { ProjectHeader } from '../components/ProjectHeader';
import { ProjectCard } from '../components/ProjectCard';
import { projects as staticProjects } from '../data/projects';
import { cachedFetchJson } from '../../../common/apiCache';

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [projectsList, setProjectsList] = useState(staticProjects);

  useEffect(() => {
    document.title = 'Our Projects | TRACE Sri Lanka';
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

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return projectsList;

    return projectsList.filter((project) => {
      if (!normalizedQuery) return true;

      return (
        project.name.toLowerCase().includes(normalizedQuery) ||
        project.shortDescription.toLowerCase().includes(normalizedQuery) ||
        project.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [searchQuery, projectsList]);

  const handleReset = () => {
    setSearchQuery('');
  };

  return (
    <>
      <ProjectHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={projectsList.length}
        filteredCount={filteredProjects.length}
      />

      <main className="projects-section">
        <div className="container">
          {filteredProjects.length > 0 ? (
            <div className="projects-grid">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No matching projects found</h3>
              <p>Try adjusting your search keyword.</p>
              <button type="button" className="btn-primary" onClick={handleReset}>
                Show All Projects
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
