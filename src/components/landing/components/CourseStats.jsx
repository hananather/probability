'use client';

import React from 'react';

const CourseStats = React.memo(() => {
  const stats = [
    { value: '8', label: 'Chapters' },
    { value: '122', label: 'Interactive Widgets' },
    { value: '400+', label: 'Exercises' },
    { value: '24', label: 'Hours of Content' }
  ];
  
  return (
    <section className="py-16 px-4 lg:pl-32 border-t border-neutral-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="text-4xl font-bold text-teal-400 mb-2">{stat.value}</div>
              <div className="text-neutral-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

CourseStats.displayName = 'CourseStats';

export default CourseStats;