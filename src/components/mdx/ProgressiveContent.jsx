"use client";
import React, { useState } from 'react';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';

// Simple component that breaks content into sections at <SectionBreak />
export function ProgressiveContent({ children }) {
  const [currentSection, setCurrentSection] = useState(0);
  
  // Convert children to array and split by SectionBreak components
  const childArray = React.Children.toArray(children);
  const sections = [];
  let currentSectionContent = [];
  
  childArray.forEach((child) => {
    if (child.type && child.type.name === 'SectionBreak') {
      sections.push(currentSectionContent);
      currentSectionContent = [];
    } else {
      currentSectionContent.push(child);
    }
  });
  
  // Don't forget the last section
  if (currentSectionContent.length > 0) {
    sections.push(currentSectionContent);
  }
  
  const handleContinue = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };
  
  return (
    <div>
      {/* Progress Bar - Full width sticky header */}
      <div className="sticky top-0 bg-[#0F0F10]/95 backdrop-blur-sm border-b border-neutral-800 py-6 z-20 -mx-6 px-6 mb-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-400">Section {currentSection + 1} of {sections.length}</span>
            <span className="text-sm text-neutral-500">{Math.round((currentSection + 1) / sections.length * 100)}% Complete</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Content Container */}
      <div className="max-w-3xl mx-auto">
        {/* Rendered Sections */}
        <div className="space-y-12 mdx-content">
          {sections.slice(0, currentSection + 1).map((section, index) => (
            <div 
              key={index} 
              className={`${index === currentSection ? 'animate-fadeIn' : ''}`}
            >
              {section}
              {/* Section divider */}
              {index < currentSection && index < sections.length - 1 && (
                <div className="mt-12 flex items-center justify-center">
                  <div className="w-16 h-px bg-neutral-800"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      
        {/* Continue Button - Aligned with content */}
        {currentSection < sections.length - 1 && (
          <div className="mt-12 pb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
              </div>
              <Button 
                onClick={handleContinue}
                className="mx-6 min-w-[160px] bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-600/20"
              >
                Continue →
              </Button>
              <div className="flex-1">
                <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
              </div>
            </div>
          </div>
        )}
      
        {/* Completion Message */}
        {currentSection === sections.length - 1 && (
          <div className="mt-12 pb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-[2px] rounded-lg">
              <div className="bg-[#0F0F10] rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-xl font-semibold text-white mb-2">
                  Section Complete!
                </p>
                <p className="text-neutral-400">
                  Great job! You've completed this section.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Marker component to indicate section breaks in MDX
export function SectionBreak() {
  return null; // This component is just a marker
}