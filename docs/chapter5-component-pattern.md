# Chapter 5 Component Standardization Pattern

## Overview
This document defines the standardized structure for all Chapter 5 (Estimation) components to ensure pedagogical consistency and optimal learning flow.

## Core Principles

### 1. Flexible Tab Structure
- **Not fixed to 3 tabs** - Use 2-4 tabs based on content needs
- Focus on pedagogical soundness over rigid structure
- Each tab should represent a distinct learning phase

### 2. Common Tab Patterns

#### Pattern A: Foundations → Worked Examples → Quick Reference (3 tabs)
Best for topics with clear theory-practice division:
- **Foundations** (Emerald): Core concepts, intuitive understanding, mathematical framework
- **Worked Examples** (Blue): Step-by-step problems, real-world applications
- **Quick Reference** (Violet): Formulas, common mistakes, key takeaways

#### Pattern B: Intuitive → Formal → Exploration (3 tabs)
Best for conceptually complex topics:
- **Intuitive** (Emerald): Visual understanding, real-world motivation
- **Formal** (Blue): Mathematical rigor, proofs, derivations
- **Exploration** (Orange): Interactive simulations, parameter effects

#### Pattern C: 4-Tab Structure (when needed)
For comprehensive topics like Statistical Inference:
- **Foundations**: Building blocks
- **Worked Examples**: Practice and application
- **Quick Reference**: Tools and formulas
- **Interactive Explorer**: Advanced exploration

## Implementation Template

```jsx
"use client";
import React, { useState } from "react";
import { cn } from '@/lib/utils';
import { QuizBreak } from '../mdx/QuizBreak';
import { 
  BookOpen, Calculator, Lightbulb, Zap 
} from 'lucide-react';

// Define learning tabs based on content needs
const LEARNING_TABS = [
  { 
    id: 'foundations', 
    label: 'Foundations', 
    icon: <BookOpen className="w-4 h-4" />,
    color: 'emerald',
    description: 'Core concepts and intuition'
  },
  { 
    id: 'worked-examples', 
    label: 'Worked Examples', 
    icon: <Calculator className="w-4 h-4" />,
    color: 'blue',
    description: 'Step-by-step problem solving'
  },
  { 
    id: 'quick-reference', 
    label: 'Quick Reference', 
    icon: <Lightbulb className="w-4 h-4" />,
    color: 'violet',
    description: 'Formulas and key points'
  }
];

export default function ComponentName() {
  const [activeTab, setActiveTab] = useState('foundations');
  
  const tabContent = {
    'foundations': (
      <div className="space-y-8">
        {/* Intuitive introductions */}
        {/* Core concepts */}
        {/* Mathematical foundations */}
      </div>
    ),
    'worked-examples': (
      <div className="space-y-8">
        {/* Real-world examples */}
        {/* Step-by-step solutions */}
        {/* Practice problems */}
      </div>
    ),
    'quick-reference': (
      <div className="space-y-8">
        {/* Formula reference */}
        {/* Common mistakes */}
        {/* Key takeaways */}
      </div>
    )
  };
  
  return (
    <VisualizationContainer>
      {/* Learning Path Header */}
      <div className="mb-8 bg-gradient-to-br from-neutral-800/50 to-neutral-700/50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Learning Path</h2>
        <p className="text-neutral-300">
          Master [topic] through structured learning modules
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-neutral-800/50 rounded-lg p-1">
        {LEARNING_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-md transition-all",
              activeTab === tab.id
                ? `bg-${tab.color}-600 text-white`
                : "text-neutral-400 hover:text-white hover:bg-neutral-700"
            )}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </div>
            <span className="text-xs opacity-80 mt-1">{tab.description}</span>
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="min-h-[600px]">
        {tabContent[activeTab]}
      </div>
      
      {/* Quiz Section - ALWAYS at bottom */}
      <div className="mt-12 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-6">
        <h3 className="text-xl font-bold text-blue-400 mb-4">Check Your Understanding</h3>
        <QuizBreak
          questions={[
            // 5 questions minimum covering all tabs
          ]}
        />
      </div>
      
      <SectionComplete chapter={5} />
    </VisualizationContainer>
  );
}
```

## Content Organization Guidelines

### 1. Foundations/Intuitive Tab
- Start with real-world motivation
- Build intuitive understanding before formulas
- Use interactive visualizations
- Include conceptual explanations

### 2. Worked Examples/Formal Tab
- Step-by-step problem solving
- Multiple difficulty levels
- Real dataset examples
- Show common applications

### 3. Quick Reference Tab
- Formula sheets
- Decision flowcharts
- Common mistakes to avoid
- Key takeaways summary
- Field-specific applications

### 4. Interactive Explorer (if needed)
- Advanced simulations
- Parameter exploration
- Deep-dive topics
- Research extensions

## Quiz Section Requirements

Every component MUST have a quiz section that:
1. Appears at the bottom after all tabs
2. Contains 5+ multiple-choice questions
3. Covers concepts from ALL tabs
4. Provides detailed explanations
5. Uses the standard `QuizBreak` component

## Visual Consistency

### Color Coding
- **Emerald** (#10b981): Foundations/Intuitive
- **Blue** (#3b82f6): Worked Examples/Formal
- **Violet** (#7c3aed): Quick Reference
- **Orange** (#f97316): Interactive/Exploration

### Tab Structure
- Full-width tab container with subtle background
- Active tab has colored background
- Inactive tabs are neutral with hover effects
- Include icon and description for clarity

## Migration Checklist

When updating existing components:

1. **Analyze Content**
   - [ ] Identify all existing sections
   - [ ] Categorize by learning objective
   - [ ] Determine optimal tab structure (2-4 tabs)

2. **Reorganize**
   - [ ] Group related content into tabs
   - [ ] Ensure logical flow within each tab
   - [ ] Balance content across tabs

3. **Add Standard Elements**
   - [ ] Learning Path header
   - [ ] Tab navigation with icons
   - [ ] Quiz section at bottom
   - [ ] Section complete component

4. **Extract Practice Components**
   - [ ] Move extensive practice problems to separate files
   - [ ] Create dedicated practice components when needed
   - [ ] Link from main component

5. **Test**
   - [ ] Verify all interactions work
   - [ ] Check MathJax rendering
   - [ ] Ensure responsive design
   - [ ] Run build to catch errors

## Benefits

1. **Reduced Cognitive Load**: Content chunked into manageable sections
2. **Clear Learning Path**: Students know what to expect
3. **Flexible Pacing**: Can focus on specific aspects
4. **Better Retention**: Spaced learning across tabs
5. **Consistent Experience**: Familiar navigation pattern

## Examples

### Good Tab Organization
- **5-1 Statistical Inference**: 4 tabs due to comprehensive content
- **5-2 Confidence Intervals**: 3 tabs (Intuitive, Formal, Practice)
- **5-3 Sample Size**: 2 tabs might suffice (Theory, Calculator)

### Poor Tab Organization
- Forcing 3 tabs when 2 would be clearer
- Having tabs with very uneven content
- Mixing unrelated concepts in one tab
- No clear progression between tabs