'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const HeroSection = React.memo(() => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center px-4 overflow-hidden">
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
        <p className="text-lg text-neutral-400 mb-10 max-w-3xl mx-auto">
          An educational platform for engineering students to master probability, statistics, and linear regression through visual and interactive tools.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/chapter1">
            <Button size="lg" variant="primary" className="group">
              Start Learning
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#chapters">
            <Button size="lg" className="bg-neutral-700 hover:bg-neutral-600">
              Explore Curriculum
            </Button>
          </Link>
          <Link href="/learn/gold-standard-animations">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white group">
              <Sparkles className="mr-2 h-5 w-5" />
              Gold Standard Animations
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;