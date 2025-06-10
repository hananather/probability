# Chapter 2: Transformations of Random Variables - Documentation

## Overview
Added two new interactive visualization components to Chapter 2 that demonstrate how functions transform random variables and their distributions. These components directly address the course material on properties of expectations and variance under transformations.

## New Components

### 1. LinearTransformations.jsx
**Purpose**: Demonstrates linear transformations Y = aX + b and their effects on distributions

**Key Features**:
- Interactive sliders for scale factor (a) and shift (b)
- Real-time visualization showing both original and transformed distributions
- Animated transformation option to see gradual changes
- Visual proof of key properties:
  - E[aX + b] = aE[X] + b
  - Var(aX + b) = a²Var(X)
  - SD(aX + b) = |a|SD(X)

**Educational Value**:
- Shows how scaling affects spread (variance)
- Shows how shifting affects center (expectation) but not spread
- Demonstrates negative scaling (reflection)
- Provides numerical verification of theoretical formulas

### 2. FunctionTransformations.jsx
**Purpose**: Explores general function transformations Y = g(X) beyond linear cases

**Key Features**:
- Multiple transformation functions:
  - Square (Y = X²)
  - Absolute value (Y = |X|)
  - Cube (Y = X³)
  - Square root (Y = √X)
  - Custom polynomial (Y = aX² + bX + c)
- Function mapping visualization showing X → Y mappings
- Distribution comparison showing P(X) vs P(Y)
- Interactive highlighting to trace individual mappings
- Detailed transformation table

**Educational Value**:
- Demonstrates that E[g(X)] ≠ g(E[X]) for non-linear functions
- Shows how multiple X values can map to same Y (e.g., X² maps ±2 to 4)
- Illustrates probability aggregation when values collapse
- Explores how different functions affect distribution shape

## Integration with Course Material

### Course Coverage (from Chapter 2 PDF):
- Properties of Expectations (Page 22/Section 2.2)
  - E[aX] = aE[X]
  - E[X + a] = E[X] + a
  - Var[aX] = a²Var[X]
  - Var[X + a] = Var[X]

### How Components Address This:
1. **LinearTransformations** directly visualizes all linear transformation properties
2. **FunctionTransformations** extends to show what happens with non-linear functions
3. Both components provide numerical verification alongside visual demonstration

## Technical Implementation

### Design Patterns Used:
- Responsive layout following project's 80-90% space utilization principle
- Consistent color scheme (blue for original, green for transformed)
- Real-time D3.js visualizations with smooth transitions
- Proper MathJax integration for mathematical notation
- Error boundaries for robustness

### Key Technical Features:
- Efficient distribution aggregation for many-to-one mappings
- Animated transitions for educational clarity
- Hover interactions for exploring individual values
- Responsive SVG visualizations that scale properly

## Usage in Chapter 2

The components are integrated as a new section (2.3) in Chapter 2:
- Section 2.1: Random Variables & Distributions (existing)
- Section 2.2: Expectation & Variance (existing)
- **Section 2.3: Transformations of Random Variables (NEW)**

## Future Enhancement Opportunities

1. **Sum of Random Variables**: Component showing Z = X + Y with convolution
2. **Product of Random Variables**: Exploring E[XY] and independence
3. **Moment Generating Functions**: Visual representation of MGFs
4. **Engineering Applications**: Real-world transformation examples
5. **Interactive Exercises**: Problem sets with immediate feedback

## Code Quality
- All components follow project conventions
- Proper error handling and edge cases
- Responsive design for mobile/tablet/desktop
- Accessibility considerations (color contrast, labels)
- Performance optimized (React.memo where appropriate)

## Summary
These new components significantly enhance Chapter 2 by providing interactive, visual demonstrations of abstract mathematical concepts. They bridge the gap between theoretical formulas and intuitive understanding, making the material more accessible to engineering students.