'use client';

import React, { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const ChapterCard = React.memo(({ chapter, index, visualization: Visualization }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const colors = ['teal', 'blue', 'purple', 'emerald', 'orange', 'pink', 'indigo', 'violet'];
  const color = colors[index];
  
  return (
    <div
      className="bg-neutral-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-48 bg-gradient-to-br from-neutral-900 to-neutral-800 relative overflow-hidden">
        <Suspense fallback={<div className="w-full h-full bg-neutral-900" />}>
          <Visualization isActive={isHovered} />
        </Suspense>
      </div>
      <div className="p-6">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">
            Chapter {index + 1}
          </h3>
          <span className="text-sm text-neutral-400">
            {chapter.duration}
          </span>
        </div>
        <h4 className={`text-xl font-bold mb-3 text-${color}-400`}>
          {chapter.title}
        </h4>
        <p className="text-sm text-neutral-300 leading-relaxed">
          {chapter.description}
        </p>
        <div className="mt-4 pt-4 border-t border-neutral-700">
          <Link href={`/chapter${index + 1}`}>
            <Button 
              variant="primary" 
              size="sm" 
              className={`w-full bg-${color}-600 hover:bg-${color}-700 group`}
            >
              Begin Learning
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
});

ChapterCard.displayName = 'ChapterCard';

export default ChapterCard;