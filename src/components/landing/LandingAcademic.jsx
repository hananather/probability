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
  const sectionRefs = useRef([]);
  
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          setCurrentSection(index);
        }
      });
    }, observerOptions);
    
    // Observe section refs
    const refs = sectionRefs.current.filter(Boolean);
    refs.forEach(ref => observer.observe(ref));
    
    return () => {
      refs.forEach(ref => observer.unobserve(ref));
      observer.disconnect();
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
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <div className="w-32 h-[700px]">
          <JourneyPath currentSection={currentSection} />
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