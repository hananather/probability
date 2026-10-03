'use client';

import React, { useId, useState } from 'react';
import Link from 'next/link';
import { curveBasis, line } from '@/utils/d3-utils';
import { usePageVisibility, useReducedMotion } from '@/hooks/useReducedMotion';

const CHAPTERS = [
  { name: 'Introduction', color: '#3b82f6', x: 40, y: 70 },
  { name: 'Discrete', color: '#10b981', x: 25, y: 130 },
  { name: 'Continuous', color: '#f59e0b', x: 55, y: 190 },
  { name: 'Statistics', color: '#8b5cf6', x: 30, y: 250 },
  { name: 'Estimation', color: '#f97316', x: 50, y: 310 },
  { name: 'Hypothesis', color: '#ef4444', x: 35, y: 370 },
  { name: 'Regression', color: '#06b6d4', x: 45, y: 430 }
];

const JOURNEY_LINE = line().x(chapter => chapter.x).y(chapter => chapter.y).curve(curveBasis)(CHAPTERS);

const JourneyPath = React.memo(({ currentSection, scrollProgress = 0 }) => {
  const gradientId = `journey-gradient-${useId().replace(/:/g, '')}`;
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisibility();
  const activeIndex = Math.max(-1, Math.min(CHAPTERS.length - 1, currentSection));
  const progress = Math.max(0, Math.min(1, scrollProgress));
  const scaledProgress = progress > 0 ? Math.min(1, progress * 0.9 + 0.05) : 0;

  return (
    <nav className="relative w-full h-full" aria-label="Chapter shortcuts">
      <style>{`
        @keyframes probability-journey-pulse {
          0% { r: 9px; opacity: 0.6; }
          66.67%, 100% { r: 20px; opacity: 0; }
        }
        .probability-journey-pulse { animation: probability-journey-pulse 3s linear infinite; }
        @media (max-width: 1023px), (prefers-reduced-motion: reduce) {
          .probability-journey-pulse { animation: none; display: none; }
        }
      `}</style>
      <svg className="w-full h-full" viewBox="0 0 80 500" aria-label="Seven chapters">
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="500">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <path d={JOURNEY_LINE} fill="none" stroke="#3f3f46" strokeWidth="2" strokeDasharray="4,4" opacity="0.5" />
        <path
          className="progress-path"
          d={JOURNEY_LINE}
          pathLength="1"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeDasharray="1"
          strokeDashoffset={1 - scaledProgress}
          strokeLinecap="round"
          opacity={progress > 0 ? 0.8 : 0}
        />
        {CHAPTERS.map((chapter, index) => {
          const active = index === activeIndex;
          const hovered = hoveredIndex === index;
          const reached = progress >= (index + 0.5) / CHAPTERS.length;

          return (
            <Link
              key={chapter.name}
              href={`/chapter${index + 1}`}
              aria-label={`Chapter ${index + 1}: ${chapter.name}`}
              aria-current={active ? 'location' : undefined}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
            >
              <g className="milestone" transform={`translate(${chapter.x}, ${chapter.y})`}>
                <circle r="22" fill="transparent" aria-hidden="true" />
                <circle
                  className="milestone-circle"
                  r={hovered ? 10 : active ? 9 : 8}
                  fill={reached ? chapter.color : '#18181b'}
                  stroke={chapter.color}
                  strokeWidth={hovered ? 4 : 3}
                  strokeOpacity={active ? 1 : index < activeIndex ? 0.7 : 0.5}
                />
                <circle
                  className="milestone-dot"
                  r={hovered || active ? 4 : 3}
                  fill={reached ? '#ffffff' : '#3f3f46'}
                  pointerEvents="none"
                />
                {active && !reducedMotion && pageVisible && (
                  <circle
                    className="probability-journey-pulse"
                    r="9"
                    fill="none"
                    stroke={chapter.color}
                    strokeWidth="2"
                    pointerEvents="none"
                    aria-hidden="true"
                  />
                )}
              </g>
            </Link>
          );
        })}
      </svg>
      {hoveredIndex !== null && (
        <div
          className="absolute left-full ml-2 pointer-events-none z-50"
          style={{ top: `${CHAPTERS[hoveredIndex].y}px`, transform: 'translateY(-50%)' }}
          aria-hidden="true"
        >
          <div className="bg-neutral-800/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs whitespace-nowrap border border-neutral-700">
            Chapter {hoveredIndex + 1}
          </div>
        </div>
      )}
    </nav>
  );
});

JourneyPath.displayName = 'JourneyPath';

export default JourneyPath;
