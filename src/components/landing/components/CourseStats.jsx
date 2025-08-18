'use client';

import React, { useEffect, useState, useRef } from 'react';
import { BookOpen, Activity, PenTool, Clock } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';

const CourseStats = React.memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({ chapters: 0, widgets: 0, exercises: 0, hours: 0 });
  const statsRef = useRef(null);
  const { overallStats } = useProgress();
  
  const stats = [
    { 
      value: '7', 
      label: 'Chapters',
      icon: BookOpen,
      color: 'text-teal-400',
      bgColor: 'bg-teal-900/20',
      description: `${overallStats?.completedChapters || 0} completed`,
      targetValue: 7
    },
    { 
      value: '147', 
      label: 'Interactive Widgets',
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      description: 'Hands-on learning',
      targetValue: 147
    },
    { 
      value: '400+', 
      label: 'Exercises',
      icon: PenTool,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      description: 'Practice problems',
      targetValue: 400
    },
    { 
      value: '24', 
      label: 'Hours of Content',
      icon: Clock,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      description: 'Comprehensive coverage',
      targetValue: 24
    }
  ];
  
  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [isVisible]);
  
  // Animated counter effect
  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      
      setCounters({
        chapters: Math.floor((7 * currentStep) / steps),
        widgets: Math.floor((147 * currentStep) / steps),
        exercises: Math.floor((400 * currentStep) / steps),
        hours: Math.floor((24 * currentStep) / steps)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters({
          chapters: 7,
          widgets: 147,
          exercises: 400,
          hours: 24
        });
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [isVisible]);
  
  // Format counter value based on stat type
  const formatValue = (stat, counterValue) => {
    if (stat.label === 'Exercises') {
      return `${counterValue}+`;
    }
    return counterValue.toString();
  };
  
  return (
    <section 
      className="py-16 px-4 lg:pl-32 border-t border-neutral-800"
      ref={statsRef}
      role="region"
      aria-label="Course statistics"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="sr-only">Course Statistics</h2>
        
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            // Special handling for "Interactive Widgets" to map to "widgets" counter
            let counterKey;
            if (stat.label === 'Interactive Widgets') {
              counterKey = 'widgets';
            } else if (stat.label === 'Hours of Content') {
              counterKey = 'hours';
            } else {
              counterKey = stat.label.toLowerCase().split(' ')[0];
            }
            const currentValue = counters[counterKey] || 0;
            
            return (
              <div 
                key={index} 
                className="group relative"
                role="group"
                aria-labelledby={`stat-label-${index}`}
                aria-describedby={`stat-desc-${index}`}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon container */}
                  <div 
                    className={`w-16 h-16 ${stat.bgColor} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    aria-hidden="true"
                  >
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  
                  {/* Animated counter */}
                  <dd 
                    className={`text-4xl font-bold ${stat.color} mb-2 transition-all duration-300`}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {isVisible ? formatValue(stat, currentValue) : '0'}
                  </dd>
                  
                  {/* Label */}
                  <dt 
                    id={`stat-label-${index}`}
                    className="text-neutral-400 font-medium"
                  >
                    {stat.label}
                  </dt>
                  
                  {/* Additional description */}
                  <span 
                    id={`stat-desc-${index}`}
                    className="text-xs text-neutral-500 mt-1"
                  >
                    {stat.description}
                  </span>
                  
                  {/* Progress indicator for chapters */}
                  {stat.label === 'Chapters' && overallStats && (
                    <div className="w-full mt-3">
                      <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-500 transition-all duration-1000"
                          style={{ 
                            width: `${(overallStats.completedChapters / 7) * 100}%`,
                            transitionDelay: '1s'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </dl>
        
        {/* Overall progress summary */}
        {overallStats && overallStats.totalProgress > 0 && (
          <div className="mt-8 pt-8 border-t border-neutral-800">
            <div className="text-center">
              <p className="text-sm text-neutral-400">
                Overall Course Progress
              </p>
              <div className="flex items-center justify-center mt-2 gap-4">
                <div className="flex-1 max-w-xs">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-1000"
                      style={{ width: `${overallStats.totalProgress}%` }}
                    />
                  </div>
                </div>
                <span className="text-lg font-bold text-teal-400">
                  {overallStats.totalProgress}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

CourseStats.displayName = 'CourseStats';

export default CourseStats;