import React, { useEffect, useMemo, useState } from 'react';
import { ProjectHeader } from '../components/ProjectHeader';
import { ProjectCard } from '../components/ProjectCard';
import { projects } from '../data/projects';

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Our Projects | TRACE Sri Lanka';
  }, []);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      if (!normalizedQuery) return true;

      return (
        project.name.toLowerCase().includes(normalizedQuery) ||
        project.shortDescription.toLowerCase().includes(normalizedQuery) ||
        project.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [searchQuery]);

  const handleReset = () => {
    setSearchQuery('');
  };

  return (
    <>
      <ProjectHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={projects.length}
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
