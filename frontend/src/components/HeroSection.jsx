import React, { useRef, useEffect, useState } from 'react';
import traceVideo from '../assets/Trace Vedio.mp4';

const DEFAULT_SETTINGS = {
  heroMediaType: 'default',
  heroImageUrl: '',
  heroImages: [],
  heroVideoUrl: '',
  heroBadge: 'TRACE COMMUNITY HUB, SRI LANKA',
  heroTitle: 'Where innovation meets community and culture.',
  heroSubtitle:
    'From Shed sessions to Midweek Boost evenings, discover and register for the events shaping TRACE Expert City — then keep every one of them in view.',
};

export default function HeroSection({ scrollToEvents, onNavigateSpaces }) {
  const videoRef = useRef(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('eventhub_hero_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.heroImageUrl === '/home.jpeg' || parsed.heroTitle === 'Where Innovation Meets Community and Creativity.') {
          return DEFAULT_SETTINGS;
        }
        return parsed;
      }
      return DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/hero');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
        localStorage.setItem('eventhub_hero_settings', JSON.stringify(data.data));
      }
    } catch (e) {
      // Use fallback cached settings
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleUpdate = (e) => {
      if (e.detail) {
        setSettings(e.detail);
      } else {
        fetchSettings();
      }
    };

    window.addEventListener('hero_settings_updated', handleUpdate);
    return () => window.removeEventListener('hero_settings_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (settings.heroMediaType !== 'image' && videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  }, [settings.heroMediaType, settings.heroVideoUrl]);

  // Derive multiple hero images (supporting up to 10 photos)
  const heroImagesList = (Array.isArray(settings.heroImages) && settings.heroImages.length > 0)
    ? settings.heroImages.filter(Boolean)
    : (settings.heroImageUrl ? [settings.heroImageUrl] : []);

  const isImageMode = settings.heroMediaType === 'image' && heroImagesList.length > 0;
  const isCustomVideoMode = settings.heroMediaType === 'video' && Boolean(settings.heroVideoUrl);

  // Auto transition photos one by one every 4.5 seconds
  useEffect(() => {
    if (isImageMode && heroImagesList.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % heroImagesList.length);
      }, 4500);
      return () => clearInterval(timer);
    }
  }, [isImageMode, heroImagesList.length]);

  // Keep index within bounds if photos count changes
  useEffect(() => {
    if (currentSlideIndex >= heroImagesList.length) {
      setCurrentSlideIndex(0);
    }
  }, [heroImagesList.length]);

  return (
    <section className="hero-custom-section" id="hero-section">
      {/* Background Layer (Video or Custom Image Slideshow) */}
      <div className="hero-video-wrapper">
        {isImageMode ? (
          <div className="hero-slideshow-container" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
            {heroImagesList.map((imgUrl, index) => (
              <div
                key={`${imgUrl}-${index}`}
                className={`hero-slide-layer ${index === currentSlideIndex ? 'active' : ''}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: index === currentSlideIndex ? 1 : 0,
                  transform: index === currentSlideIndex ? 'scale(1.04)' : 'scale(1.0)',
                  transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 6s ease-out',
                  zIndex: index === currentSlideIndex ? 1 : 0,
                  pointerEvents: 'none',
                }}
              >
                <img
                  src={imgUrl}
                  alt={`Hero Banner Photo ${index + 1}`}
                  className="hero-image-element"
                  onError={(e) => {
                    e.currentTarget.style.opacity = 0;
                  }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    minWidth: '100%',
                    minHeight: '100%',
                    width: '100%',
                    height: '100%',
                    transform: 'translate(-50%, -50%)',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
              </div>
            ))}
          </div>
        ) : isCustomVideoMode ? (
          <video
            ref={videoRef}
            key={settings.heroVideoUrl}
            className="hero-video-element video-ready"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src={settings.heroVideoUrl} />
          </video>
        ) : (
          <video
            ref={videoRef}
            className="hero-video-element video-ready"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src={traceVideo} type="video/mp4" />
            <source src="/trace-video.mp4" type="video/mp4" />
          </video>
        )}

        <div className="hero-video-overlay" style={{ zIndex: 2 }} />

        {/* Slideshow Arrow Navigation & Dot Indicators */}
        {isImageMode && heroImagesList.length > 1 && (
          <div className="hero-slideshow-controls" style={{ zIndex: 10 }}>
            <button
              type="button"
              className="hero-slide-arrow hero-slide-arrow-prev"
              onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + heroImagesList.length) % heroImagesList.length)}
              title="Previous photo"
              aria-label="Previous photo"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
              type="button"
              className="hero-slide-arrow hero-slide-arrow-next"
              onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % heroImagesList.length)}
              title="Next photo"
              aria-label="Next photo"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>

            {/* Slider Dots Indicator Bar */}
            <div className="hero-slider-indicator-bar">
              <div className="hero-slider-dots-row">
                {heroImagesList.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    className={`hero-slider-dot-btn ${dotIdx === currentSlideIndex ? 'active' : ''}`}
                    onClick={() => setCurrentSlideIndex(dotIdx)}
                    title={`View photo ${dotIdx + 1}`}
                    aria-label={`View photo ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="section-container hero-custom-container">
        {/* Hero Content Area */}
        <div className="hero-custom-content">
          {/* Badge */}
          <div className="hero-custom-badge">
            <span className="badge-dot-amber"></span>
            <span>{settings.heroBadge || 'TRACE COMMUNITY HUB, SRI LANKA'}</span>
          </div>

          {/* Heading */}
          <h1 className="hero-custom-title">
            {settings.heroTitle || 'Where innovation meets community and culture.'}
          </h1>

          {/* Subtitle */}
          <p className="hero-custom-subtitle">
            {settings.heroSubtitle ||
              'From Shed sessions to Midweek Boost evenings, discover and register for the events shaping TRACE Expert City — then keep every one of them in view.'}
          </p>

          {/* Action Buttons */}
          <div className="hero-custom-actions">
            <button
              type="button"
              className="btn-hero-primary"
              onClick={() => scrollToEvents && scrollToEvents('upcoming')}
            >
              Explore Upcoming Events
            </button>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={() => {
                if (onNavigateSpaces) {
                  onNavigateSpaces();
                } else if (scrollToEvents) {
                  scrollToEvents('venues-page');
                }
              }}
            >
              Explore Spaces
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
