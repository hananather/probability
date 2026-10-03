'use client';

import React from 'react';
import { BookOpen, Activity, PenTool, Calculator } from 'lucide-react';
import { CURRICULUM_METADATA as counts } from '@/lib/curriculum/metadata';
import { useProgress } from '@/hooks/useProgress';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const CourseStats = React.memo(() => {
  const reducedMotion = useReducedMotion();
  const { overallStats } = useProgress();
  
  const stats = [
    { 
      value: String(counts.publishedChapters),
      label: 'Chapters',
      icon: BookOpen,
      color: 'text-teal-400',
      bgColor: 'bg-teal-900/20',
      description: `${overallStats?.completedChapters || 0} completed`
    },
    { 
      value: String(counts.primaryHubLessons + counts.chapterSixBonusLessons),
      label: 'Learning Modules',
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      description: `${counts.primaryHubLessons} primary, ${counts.chapterSixBonusLessons} bonus`
    },
    { 
      value: String(counts.engineeringQuizQuestions + counts.alternateQuizQuestions),
      label: 'Chapter Quiz Questions',
      icon: PenTool,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      description: `${counts.engineeringQuizQuestions} engineering, ${counts.alternateQuizQuestions} alternate`
    },
    { 
      value: String(counts.formulaBuilders),
      label: 'Formula Builders',
      icon: Calculator,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      description: 'Build formulas step by step'
    }
  ];
  
  return (
    <section 
      className="py-16 px-4 lg:pl-32 border-t border-neutral-800"
      role="region"
      aria-label="Course statistics"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="sr-only">Course Statistics</h2>
        
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            
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
                  
                  {/* Verified curriculum total */}
                  <dd 
                    className={`text-4xl font-bold ${stat.color} mb-2 transition-all duration-300`}
                  >
                    {stat.value}
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
                            width: `${(overallStats.completedChapters / counts.publishedChapters) * 100}%`,
                            transitionDuration: reducedMotion ? '0ms' : '1000ms'
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
                      style={{ width: `${overallStats.totalProgress}%`, transitionDuration: reducedMotion ? '0ms' : '1000ms' }}
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
