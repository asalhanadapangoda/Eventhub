import React from 'react';
import { Search, X } from 'lucide-react';

export function ProjectHeader({
  searchQuery,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
  totalCount,
  filteredCount,
}) {
  return (
    <header className="project-header">
      <div className="container">
        <div className="header-eyebrow">
          <span className="eyebrow-dot" aria-hidden="true" />
          <span>TRACE Sri Lanka Ecosystem</span>
        </div>

        <h1 className="project-header-title">
          Our <span className="gradient-accent">Projects</span>
        </h1>

        <p className="project-header-subtitle">
          Discover the projects, programmes and initiatives driving innovation and entrepreneurship
          through TRACE Sri Lanka.
        </p>

        <div className="showcase-controls" style={{ marginTop: '32px', marginBottom: '0' }}>
          <div className="search-bar-row">
            <div className="search-input-wrap">
              <Search size={17} className="search-icon" aria-hidden="true" />
              <input
                type="search"
                className="search-input"
                placeholder="Search projects by name, sector, or keyword..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Search projects"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="results-badge" aria-live="polite">
              Showing {filteredCount} of {totalCount} projects
            </div>
          </div>

          <div className="filter-pills" role="tablist" aria-label="Filter projects by category">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`filter-pill ${isActive ? 'active' : ''}`}
                  onClick={() => onCategoryChange(cat.label)}
                >
                  <span>{cat.label}</span>
                  <span className="filter-count">{cat.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

