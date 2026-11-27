import React, { useEffect, useMemo, useState } from 'react';
import { ProjectHeader } from '../components/ProjectHeader';
import { ProjectCard } from '../components/ProjectCard';
import { projects } from '../data/projects';

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Projects');

  useEffect(() => {
    document.title = 'Our Projects | TRACE Sri Lanka';
  }, []);

  const categories = useMemo(() => {
    const counts = projects.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return [
      { label: 'All Projects', count: projects.length },
      ...Object.entries(counts).map(([label, count]) => ({ label, count })),
    ];
  }, []);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesCategory =
        activeCategory === 'All Projects' || project.category === activeCategory;

      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;

      return (
        project.name.toLowerCase().includes(normalizedQuery) ||
        project.shortDescription.toLowerCase().includes(normalizedQuery) ||
        project.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [searchQuery, activeCategory]);

  const handleReset = () => {
    setSearchQuery('');
    setActiveCategory('All Projects');
  };

  return (
    <>
      <ProjectHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
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
              <p>Try adjusting your search keyword or selecting another category.</p>
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
