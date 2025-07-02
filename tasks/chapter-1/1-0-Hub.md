# Chapter 1: Introduction to Probabilities - Hub Component

## Overview
Create a centralized hub component following the Chapter 7 model without opening animations.

## Component: `1-0-IntroductionToProbabilitiesHub.jsx`

### Structure
1. **Key Concepts Card**
   - Classical probability definition: P(A) = |A|/|S|
   - Addition rule: P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
   - Conditional probability: P(A|B) = P(A ∩ B)/P(B)
   - Bayes' theorem: P(A|B) = P(B|A)P(A)/P(B)

2. **Introduction Card**
   - What is probability?
   - Why study probability?
   - Real-world applications

3. **Sections Configuration**
   - 8 sections matching course material
   - Each with: title, icon, difficulty, description, route, prerequisites

### Technical Requirements
- Use ChapterHub component from shared
- Implement createColorScheme for consistent theming
- Use framer-motion for card animations
- Responsive grid layout
- Router navigation to individual sections

### Color Scheme
- Primary: Blue/Purple gradient for probability theme
- Accent colors for different difficulty levels
- Consistent with overall site design

### Section Metadata
```javascript
sections = [
  {
    id: 'sample-spaces-events',
    title: 'Sample Spaces and Events',
    route: '/chapter1/sample-spaces-events',
    icon: 'CircleVenn',
    difficulty: 'Beginner',
    description: 'Learn about sets, unions, intersections, and Venn diagrams',
    prerequisites: []
  },
  // ... (7 more sections)
]
```