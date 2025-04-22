"use client";
import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarContent } from './ui/sidebar';

const items = [
  { title: 'Chance Events', url: '#chance-events' },
  { title: 'Expectation & Variance', url: '#expectation-variance' },
  { title: 'Central Limit Theorem', url: '#central-limit-theorem' },
  { title: 'Point Estimation', url: '#point-estimation' },
  { title: 'Confidence Interval', url: '#confidence-interval' },
  { title: 'Bootstrapping', url: '#bootstrapping' },
  { title: 'Bayesian Inference', url: '#bayesian-inference' },
];

export function AppSidebar() {
  const [activeId, setActiveId] = useState(items[0].url.substring(1));

  useEffect(() => {
    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: '0px 0px -80% 0px' });
    const headings = document.querySelectorAll('h2[id]');
    headings.forEach((h) => observer.observe(h));
    return () => headings.forEach((h) => observer.unobserve(h));
  }, []);

  return (
    <Sidebar>
      <SidebarContent>
        <nav className="space-y-2">
          {items.map((item) => {
            const id = item.url.substring(1);
            return (
              <a
                key={item.title}
                href={item.url}
                className={`block px-4 py-2 rounded hover:bg-neutral-700 ${activeId === id ? 'bg-neutral-700 font-semibold' : ''}`}
              >
                {item.title}
              </a>
            );
          })}
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
