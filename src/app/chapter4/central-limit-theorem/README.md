# Central Limit Theorem Section

## Overview
This section orchestrates two CLT components into a 4-stage progressive learning journey that helps students discover and master the Central Limit Theorem.

## Best Practices Implemented

### 1. LaTeX Rendering ✓
- Uses `dangerouslySetInnerHTML` pattern throughout
- Implements MathJax timeout pattern (100ms) for reliable rendering
- All mathematical expressions properly formatted

### 2. Component Reuse ✓
- Uses `VisualizationContainer` for main content wrapper
- Imports existing UI components (Button, Card, CardContent)
- Lazy loads CLT components for performance

### 3. Chapter 6 Style ✓
- Matches Chapter 6's page structure with dark theme
- Uses consistent spacing and layout patterns
- Back to Hub link styled to match Chapter 6

### 4. Smooth Animations ✓
- Enhanced stage transitions with scale and easing
- Vibrant gradient progress bars
- Button hover/tap animations with motion
- 0.6s-1.2s transition durations for smoothness

### 5. Simplicity First ✓
- No complex drag-and-drop interactions
- Controlled, curated progression through stages
- Clear navigation with locked stages

## Features

### Stage 1: Gateway to CLT
- Discovery-first approach with puzzle revelation
- Smooth 1.2s animation with custom easing
- Integration of CLTGateway component

### Stage 2: Properties Deep Dive
- Property selector for focused exploration
- Integration of CLTPropertiesMerged component
- Progress tracking for mathematical understanding

### Stage 3: Real-World Applications
- 4 real-world scenarios (polling, quality control, finance, medical)
- Mathematical explanations with proper LaTeX rendering
- Practical insights for each scenario

### Stage 4: Mastery Assessment
- 3-question interactive quiz
- Progress bar and scoring
- Certificate of completion

## State Management
- Understanding progress tracked across 4 concepts
- LocalStorage persistence for progress
- Auto-advancement between stages on concept mastery

## Performance
- Lazy loading for CLT components
- Smooth 60fps animations
- Efficient state updates

## Usage
Navigate to `/chapter4/central-limit-theorem` to access this section.