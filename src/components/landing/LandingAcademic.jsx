'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
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
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <div className="w-20 h-[600px]">
          <JourneyPath currentSection={currentSection} />
        </div>
      </div>
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Introduction */}
      <section className="py-16 px-4 lg:pl-32">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-neutral-300 leading-relaxed">
            This comprehensive course explores key concepts in probability, statistics, and linear regression 
            using visual and interactive tools. Each section is designed to build intuition through 
            experimentation, allowing you to observe outcomes and recognize important patterns.
          </p>
        </div>
      </section>
      
      {/* Chapter Grid */}
      <ChapterGrid onSectionRef={handleSectionRef} />
      
      {/* Course Stats */}
      <CourseStats />
      
      {/* Footer */}
      <footer className="py-12 px-4 lg:pl-32 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-neutral-400 mb-6">
            Each widget is designed to support interactive learning and develop stronger intuition 
            about the concepts behind data analysis and statistical reasoning.
          </p>
          <Link href="/chapter1">
            <Button variant="primary" size="lg" className="group">
              Begin Your Journey
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}