import React, { useState } from 'react';

export default function ImageCarouselSlider({
  images = [],
  fallbackImage = '',
  alt = 'Banner',
  className = '',
  style = {},
  children
}) {
  // Extract and normalize image list
  let imgList = [];
  if (Array.isArray(images) && images.length > 0) {
    imgList = images.filter(img => typeof img === 'string' && img.trim().length > 0 && !img.includes('photo-1517457373958-b7bdd4587205') && !img.includes('photo-1540575467063-178a50c2df87'));
  } else if (typeof images === 'string' && images.trim()) {
    const trimmed = images.trim();
    if (!trimmed.includes('photo-1517457373958-b7bdd4587205') && !trimmed.includes('photo-1540575467063-178a50c2df87')) {
      imgList = [trimmed];
    }
  }

  if (imgList.length === 0) {
    if (fallbackImage && !fallbackImage.includes('photo-1517457373958-b7bdd4587205') && !fallbackImage.includes('photo-1540575467063-178a50c2df87')) {
      imgList = [fallbackImage];
    } else {
      return (
        <div className={`carousel-slider-container ${className}`} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', color: '#94a3b8', minHeight: '200px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-regular fa-image" style={{ fontSize: '2rem', color: '#64748b' }}></i>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1' }}>No Photo</span>
          </div>
          {children}
        </div>
      );
    }
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imgList.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === imgList.length - 1 ? 0 : prev + 1));
  };

  const activeImage = imgList[currentIndex] || fallbackImage;

  return (
    <div className={`carousel-slider-container ${className}`} style={style}>
      <img
        key={currentIndex}
        src={activeImage}
        alt={`${alt} slide ${currentIndex + 1}`}
        className="carousel-slide-img"
      />

      {/* Navigation Controls when multiple photos exist */}
      {imgList.length > 1 && (
        <>
          <button
            type="button"
            className="carousel-nav-btn prev-btn"
            onClick={handlePrev}
            title="Previous Photo"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          <button
            type="button"
            className="carousel-nav-btn next-btn"
            onClick={handleNext}
            title="Next Photo"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          {/* Dots Indicator & Slide Counter */}
          <div className="carousel-indicators-bar">
            <div className="carousel-dots-group">
              {imgList.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`carousel-dot-pill ${idx === currentIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  title={`View photo ${idx + 1}`}
                />
              ))}
            </div>
            <span className="carousel-count-tag">
              <i className="fa-solid fa-camera"></i> {currentIndex + 1} / {imgList.length}
            </span>
          </div>
        </>
      )}

      {/* Overlay Children (Title, Badges, Close Button, etc.) */}
      {children}
    </div>
  );
}
