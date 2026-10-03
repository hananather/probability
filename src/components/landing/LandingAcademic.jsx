'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Footer } from '@/components/layout/Footer';
import { usePageVisibility } from '@/hooks/useReducedMotion';

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
const FAQSection = dynamic(() => import('./sections/FAQSection'), {
  ssr: false
});
const TestimonialsSection = dynamic(() => import('./sections/TestimonialsSection'), {
  ssr: false
});

export default function LandingAcademic() {
  // Toggle to show/hide testimonials section - set to true to show student success stories
  const SHOW_TESTIMONIALS = false;
  
  const [currentSection, setCurrentSection] = useState(-1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showNavigation, setShowNavigation] = useState(true);
  const sectionRefs = useRef([]);
  const testimonialsRef = useRef(null);
  
  const pageVisible = usePageVisibility();
  const scheduleUpdateRef = useRef(() => {});

  useEffect(() => {
    if (!pageVisible) return;

    let frameId = null;
    const updateScroll = () => {
      frameId = null;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const scrollableHeight = document.documentElement.scrollHeight - windowHeight;
      const progress = scrollableHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollableHeight)) : 0;
      const viewportCenter = windowHeight / 2;
      let closestSection = -1;
      let closestDistance = Infinity;

      // Keep original chapter indices when dynamically loaded sections register.
      sectionRefs.current.forEach((section, index) => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(viewportCenter - (rect.top + rect.height / 2));
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = index;
        }
      });

      const navigationVisible = !SHOW_TESTIMONIALS || !testimonialsRef.current ||
        testimonialsRef.current.getBoundingClientRect().top > viewportCenter;

      // Read layout first, then publish changes once per rendered frame.
      setScrollProgress(progress);
      if (scrollTop < 50) {
        setCurrentSection(-1);
      } else if (closestSection !== -1 && closestDistance < windowHeight) {
        setCurrentSection(closestSection);
      }
      setShowNavigation(navigationVisible);
    };

    const scheduleUpdate = () => {
      if (frameId === null) frameId = window.requestAnimationFrame(updateScroll);
    };
    scheduleUpdateRef.current = scheduleUpdate;
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleUpdate) : null;
    observer?.observe(document.body);
    scheduleUpdate();

    return () => {
      scheduleUpdateRef.current = () => {};
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      observer?.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [pageVisible]);

  const handleSectionRef = useCallback((index, element) => {
    sectionRefs.current[index] = element;
    scheduleUpdateRef.current();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Floating mathematical symbols background */}
      <FloatingSymbols />
      
      {/* Journey Progress Indicator - Only show until testimonials */}
      {showNavigation && (
        <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block transition-opacity duration-300">
          <div className="w-20 h-[500px]">
            <JourneyPath currentSection={currentSection} scrollProgress={scrollProgress} />
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Course Map */}
      <section className="py-8 px-4 lg:pl-32">
        <div className="max-w-6xl mx-auto">
          <ConceptFlowchart />
        </div>
      </section>
      
      {/* Chapter Grid */}
      <ChapterGrid onSectionRef={handleSectionRef} />
      
      {/* Testimonials Section - Hidden when SHOW_TESTIMONIALS is false */}
      {SHOW_TESTIMONIALS && (
        <div ref={testimonialsRef}>
          <TestimonialsSection />
        </div>
      )}
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* Course Stats */}
      <CourseStats />
      
      {/* Global Footer */}
      <Footer />
    </div>
  );
}
