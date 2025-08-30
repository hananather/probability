'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const HeroSection = React.memo(() => {
  const scrollToChapters = () => {
    const chaptersSection = document.getElementById('chapters');
    if (chaptersSection) {
      chaptersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative py-16 flex items-center justify-center px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 via-transparent to-transparent" />
      
      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 animate-gradient">
            Probability Lab
          </span>
        </h1>
        <p className="text-xl text-neutral-300 mb-8 leading-relaxed">
          Learn by doing. Explore interactive visualizations that make complex concepts click instantly.
        </p>
        <div className="flex justify-center">
          <Button 
            size="lg" 
            variant="primary" 
            className="group"
            onClick={scrollToChapters}
          >
            Start Learning
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;