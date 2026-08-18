import React, { useEffect, useRef } from 'react';
import './CircuitBackground.css';

/**
 * CircuitBackground — Animated SVG circuit-board decoration.
 * Sits behind all page content as a fixed backdrop.
 * Decorations are placed at edges only, never over the center content area.
 */
function CircuitBackground({ variant = 'default' }) {
  const particlesRef = useRef(null);

  useEffect(() => {
    // Generate floating particles
    const container = particlesRef.current;
    if (!container) return;

    const particles = Array.from({ length: 20 }, (_, i) => {
      const el = document.createElement('div');
      el.className = 'circuit-particle';
      el.style.cssText = `
        left: ${Math.random() * 100}%;
        top:  ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 4}s;
        animation-duration: ${3 + Math.random() * 4}s;
        opacity: ${0.2 + Math.random() * 0.4};
        width: ${2 + Math.random() * 4}px;
        height: ${2 + Math.random() * 4}px;
      `;
      return el;
    });

    particles.forEach(p => container.appendChild(p));
    return () => particles.forEach(p => p.remove());
  }, []);

  return (
    <div className={`circuit-bg circuit-bg--${variant}`} aria-hidden="true">
      {/* Particles layer */}
      <div ref={particlesRef} className="circuit-particles" />

      {/* SVG circuit lines */}
      <svg className="circuit-svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        {/* Top-left branch */}
        <g className="circuit-branch" style={{ animationDelay: '0s' }}>
          <polyline points="0,80 60,80 60,120 140,120 140,80 220,80" />
          <circle cx="60"  cy="80"  r="4" />
          <circle cx="140" cy="80"  r="4" />
          <circle cx="220" cy="80"  r="3" />
          <polyline points="60,120 60,200 100,200" />
          <circle cx="100" cy="200" r="3" />
        </g>

        {/* Top-right branch */}
        <g className="circuit-branch" style={{ animationDelay: '0.8s' }}>
          <polyline points="1920,60 1840,60 1840,100 1760,100 1760,60 1680,60" />
          <circle cx="1840" cy="60"  r="4" />
          <circle cx="1760" cy="60"  r="4" />
          <circle cx="1680" cy="60"  r="3" />
          <polyline points="1840,100 1840,180 1800,180" />
          <circle cx="1800" cy="180" r="3" />
        </g>

        {/* Bottom-left branch */}
        <g className="circuit-branch" style={{ animationDelay: '1.6s' }}>
          <polyline points="0,1000 80,1000 80,960 180,960 180,1000 280,1000" />
          <circle cx="80"  cy="1000" r="4" />
          <circle cx="180" cy="1000" r="4" />
          <polyline points="80,960 80,880 120,880" />
          <circle cx="120" cy="880" r="3" />
        </g>

        {/* Bottom-right branch */}
        <g className="circuit-branch" style={{ animationDelay: '2.4s' }}>
          <polyline points="1920,1000 1840,1000 1840,960 1740,960 1740,1000 1640,1000" />
          <circle cx="1840" cy="1000" r="4" />
          <circle cx="1740" cy="1000" r="4" />
          <polyline points="1840,960 1840,880 1800,880" />
          <circle cx="1800" cy="880" r="3" />
        </g>

        {/* Left edge lines */}
        <g className="circuit-branch" style={{ animationDelay: '1.2s' }}>
          <polyline points="0,300 40,300 40,340 0,340" />
          <circle cx="40" cy="300" r="3" />
          <circle cx="40" cy="340" r="3" />
          <polyline points="0,500 50,500 50,460 90,460 90,540 50,540 50,500" />
          <circle cx="50" cy="500" r="4" />
          <polyline points="0,700 40,700 40,740 70,740" />
          <circle cx="70" cy="740" r="3" />
        </g>

        {/* Right edge lines */}
        <g className="circuit-branch" style={{ animationDelay: '2s' }}>
          <polyline points="1920,300 1880,300 1880,340 1920,340" />
          <circle cx="1880" cy="300" r="3" />
          <circle cx="1880" cy="340" r="3" />
          <polyline points="1920,500 1870,500 1870,460 1830,460 1830,540 1870,540 1870,500" />
          <circle cx="1870" cy="500" r="4" />
          <polyline points="1920,700 1880,700 1880,740 1850,740" />
          <circle cx="1850" cy="740" r="3" />
        </g>
      </svg>

      {/* Radial glow at center */}
      <div className="circuit-center-glow" />

      {/* Grid dots overlay */}
      <div className="circuit-grid" />
    </div>
  );
}

export default CircuitBackground;
