"use client";
import React, { useState } from 'react';
import MontyHallIntro from './monty-hall/MontyHallIntro';
import MontyHallPlayground from './monty-hall/MontyHallPlayground';
import MontyHallSimulator from './monty-hall/MontyHallSimulator';
import { Button } from '../ui/button';
import { cn } from '../../lib/design-system';

const MontyHallProblem = () => {
  const [activeComponent, setActiveComponent] = useState('intro');

  // Navigation tabs
  const tabs = [
    { id: 'intro', label: 'Introduction', color: 'bg-purple-600' },
    { id: 'playground', label: 'Play the Game', color: 'bg-blue-600' },
    { id: 'simulator', label: 'Run Simulations', color: 'bg-green-600' }
  ];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 p-1 bg-neutral-800 rounded-lg max-w-2xl mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveComponent(tab.id)}
            className={cn(
              "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
              activeComponent === tab.id
                ? `${tab.color} text-white shadow-lg`
                : "text-neutral-300 hover:text-white hover:bg-neutral-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Component Display */}
      <div className="w-full">
        {activeComponent === 'intro' && (
          <MontyHallIntro onComplete={() => setActiveComponent('playground')} />
        )}
        {activeComponent === 'playground' && (
          <MontyHallPlayground />
        )}
        {activeComponent === 'simulator' && (
          <MontyHallSimulator />
        )}
      </div>

      {/* Bottom Navigation Helper */}
      {activeComponent !== 'simulator' && (
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-400 mb-2">
            {activeComponent === 'intro' 
              ? "Ready to play? Try the game yourself!"
              : "Want to see the statistics? Run hundreds of simulations!"}
          </p>
          <Button
            onClick={() => setActiveComponent(
              activeComponent === 'intro' ? 'playground' : 'simulator'
            )}
            variant="primary"
            size="sm"
          >
            {activeComponent === 'intro' ? 'Play the Game' : 'See Statistics'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MontyHallProblem;