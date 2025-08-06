'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components for better performance
const FloatingSymbols = dynamic(() => import('./components/FloatingSymbols'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" />
});

const JourneyPath = dynamic(() => import('./components/JourneyPath'));
const HeroSection = dynamic(() => import('./components/HeroSection'));
const ChapterGrid = dynamic(() => import('./components/ChapterGrid'));
const CourseStats = dynamic(() => import('./components/CourseStats'));
const ConceptFlowchart = dynamic(() => import('../shared/ConceptFlowchart'));

export default function LandingAcademic() {
  const [currentSection, setCurrentSection] = useState(-1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRefs = useRef([]);
  
  useEffect(() => {
    // Combine scroll listener with IntersectionObserver for better tracking
    const handleScroll = () => {
      // Get scroll position as percentage of page
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollableHeight = documentHeight - windowHeight;
      
      // Calculate scroll progress as percentage (0 to 1)
      const progress = scrollableHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollableHeight)) : 0;
      setScrollProgress(progress);
      
      // If at the very top of the page, reset to -1
      if (scrollTop < 50) {
        setCurrentSection(-1);
        return;
      }
      
      // Find which section is currently most visible
      const refs = sectionRefs.current.filter(Boolean);
      if (refs.length === 0) return;
      
      // Get the center of the viewport
      const viewportCenter = scrollTop + windowHeight / 2;
      
      // Find the section closest to viewport center
      let closestSection = -1;
      let closestDistance = Infinity;
      
      refs.forEach((ref, index) => {
        const rect = ref.getBoundingClientRect();
        const elementTop = rect.top + scrollTop;
        const elementCenter = elementTop + rect.height / 2;
        const distance = Math.abs(viewportCenter - elementCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = index;
        }
      });
      
      // Only update if we found a section and it's reasonably close to viewport
      if (closestSection !== -1 && closestDistance < windowHeight) {
        setCurrentSection(closestSection);
      }
    };
    
    // Also use IntersectionObserver as a fallback
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px',
      threshold: [0, 0.1, 0.5, 0.9, 1.0] // Multiple thresholds for smoother tracking
    };
    
    const observer = new IntersectionObserver((entries) => {
      // Only use observer when not scrolling
      if (window.scrollY > 50) {
        entries.forEach(entry => {
          if (entry.intersectionRatio > 0.5) {
            const index = parseInt(entry.target.dataset.index);
            setCurrentSection(prevSection => {
              // Only update if scroll handler hasn't already set it
              return prevSection === -1 ? index : prevSection;
            });
          }
        });
      }
    }, observerOptions);
    
    // Observe section refs
    const refs = sectionRefs.current.filter(Boolean);
    refs.forEach(ref => observer.observe(ref));
    
    // Add scroll listener with throttling for performance
    let scrollTimeout;
    const throttledScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        handleScroll();
        scrollTimeout = null;
      }, 50); // Throttle to 20fps
    };
    
    window.addEventListener('scroll', throttledScroll);
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      refs.forEach(ref => observer.unobserve(ref));
      observer.disconnect();
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);
  
  const handleSectionRef = (index, el) => {
    sectionRefs.current[index] = el;
  };
  
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Floating mathematical symbols background */}
      <FloatingSymbols />
      
      {/* Journey Progress Indicator */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <div className="w-20 h-[500px]">
          <JourneyPath currentSection={currentSection} scrollProgress={scrollProgress} />
        </div>
      </div>
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Course Map */}
      <section className="py-12 px-4 lg:pl-32">
        <div className="max-w-6xl mx-auto">
          <ConceptFlowchart />
        </div>
      </section>
      
      {/* Chapter Grid */}
      <ChapterGrid onSectionRef={handleSectionRef} />
      
      {/* Course Stats */}
      <CourseStats />
      
    </div>
  );
}