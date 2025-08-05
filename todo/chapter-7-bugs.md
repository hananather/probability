# Chapter 7 Bug Audit Report

## Audit Date: 2025-08-05

## Summary
Systematic bug audit of Chapter 7: Linear Regression and Correlation modules.

---

## Recently Fixed Issues (2025-08-05)

### Fixed: Correlation Coefficient Component Overlapping
- **Location**: Module 7.1 - Between chart and "Connection to Linear Regression" section
- **What was broken**: The chart visualization was overlapping with the purple "Connection to Linear Regression" section below it.
- **Why it was broken**: The GraphContainer was not wrapped in a VisualizationSection, which provides the proper spacing context. The design system uses `space-y-8` for major sections, but the GraphContainer was a direct child without proper spacing wrapper.
- **What fixed it**: Wrapped the GraphContainer in a VisualizationSection component with `className="!p-0"` to maintain the GraphContainer's internal padding while leveraging the parent's spacing rules.
- **Pattern learned**: Always wrap major visualization components (GraphContainer, etc.) in VisualizationSection to ensure proper spacing between sections. The design system spacing hierarchy is:
  - Main sections: `space-y-8`
  - Subsections: `space-y-6`  
  - Standard content: `space-y-4`
  - Detailed content: `space-y-2`

### Fixed: Controls Overlapping Chart
- **Location**: Module 7.1 - Interactive Correlation Explorer section
- **What was broken**: The controls ("Explore Different Scenarios" and "Visualization Options") were overlapping with the scatter plot chart visualization.
- **Why it was broken**: The controls were placed inside the GraphContainer along with the SVG chart, causing them to render on top of the visualization.
- **What fixed it**: Moved the controls outside of the GraphContainer and wrapped both controls and GraphContainer in a parent div with `space-y-6` for proper spacing.
- **Pattern learned**: Keep controls separate from GraphContainer content. Use proper component hierarchy with spacing wrappers.

### Fixed: Hydration Mismatch Error
- **Location**: Module 7.1 - CorrelationCoefficient component
- **What was broken**: React hydration error due to server/client mismatch: "Hydration failed because the server rendered HTML didn't match the client"
- **Why it was broken**: The component used `Math.random()` to generate data in the scenarios object, which produced different values on server and client during SSR.
- **What fixed it**: Replaced `Math.random()` with a deterministic seeded pseudo-random number generator using `Math.sin()`. This ensures the same values are generated on both server and client.
- **Pattern learned**: Never use `Math.random()` or other non-deterministic functions in initial component state or render. Always use deterministic approaches for SSR compatibility.

---

## Module 7.1 - Correlation Coefficient

### Bug #1: Text Overflow on Mobile
- **Location**: Module title "Correlation Coefficient" 
- **Priority**: Medium
- **Description**: Title text is cut off on mobile viewport (375px), showing "Correlat" on first line and "Coeffici" on second line
- **Screenshot**: 7.1-mobile-correct
- **Technical Cause**: Container width too narrow for the title text on mobile devices
- **Proposed Fix**: Add responsive text sizing or allow text wrapping with proper hyphenation

### Bug #2: Notification Badge Issue
- **Location**: Bottom left corner notification (shows "1 Issue")
- **Priority**: Low
- **Description**: Persistent notification badge showing "1 Issue" but unclear what the issue is
- **Screenshot**: 7.1-correct-url
- **Technical Cause**: Likely a development/debug feature that shouldn't be visible in production
- **Proposed Fix**: Remove or hide the notification badge in production builds

### Positive Findings:
- LaTeX formulas render correctly (27 mjx-container elements found)
- Interactive correlation visualization works properly
- Responsive layout adapts well for tablet (768px) and desktop (1400px)
- All correlation pattern buttons are functional
- Navigation back to Chapter 7 Hub works correctly

---

## Module 7.2 - Simple Linear Regression

### Bug #3: Mobile View Shows Different Interface
- **Location**: Entire page on mobile viewport
- **Priority**: High
- **Description**: On mobile (375px), the module shows a simplified navigation menu with a home icon instead of the actual content
- **Screenshot**: 7.2-mobile-top
- **Technical Cause**: Likely a responsive design issue or incorrect mobile routing
- **Proposed Fix**: Ensure mobile view displays the same content as desktop with appropriate responsive styling

### Positive Findings:
- Interactive regression line visualization works correctly on desktop
- LaTeX formulas render properly
- "Show Comparison" and "Show Calculations" buttons are functional
- Residual plot displays correctly
- Rotate Line slider interaction works smoothly

---

## Module 7.3 - Hypothesis Testing in Regression  

### Bug #4: Module Content Missing - Shows Home Icon Only
- **Location**: Entire module page
- **Priority**: Critical
- **Description**: Module shows only a blue home icon instead of actual content
- **Screenshot**: 7.3-desktop-top
- **Technical Cause**: Component not implemented or routing issue
- **Proposed Fix**: Implement the module content or fix routing configuration

---

## Module 7.4 - Confidence & Prediction Intervals

### Bug #5: Module Content Missing - Shows Home Icon Only
- **Location**: Entire module page
- **Priority**: Critical
- **Description**: Module shows only a blue home icon instead of actual content
- **Screenshot**: 7.4-check
- **Technical Cause**: Component not implemented or routing issue
- **Proposed Fix**: Implement the module content or fix routing configuration

---

## Module 7.5 - Analysis of Variance

### Bug #6: Module Content Missing - Shows Home Icon Only
- **Location**: Entire module page
- **Priority**: Critical
- **Description**: Module shows only a blue home icon instead of actual content
- **Technical Cause**: Component not implemented or routing issue
- **Proposed Fix**: Implement the module content or fix routing configuration

---

## Module 7.6 - Coefficient of Determination

### Bug #7: Module Content Missing - Shows Home Icon Only
- **Location**: Entire module page
- **Priority**: Critical
- **Description**: Module shows only a blue home icon instead of actual content
- **Technical Cause**: Component not implemented or routing issue
- **Proposed Fix**: Implement the module content or fix routing configuration

---

## Overall Chapter Issues

### Issue #1: Incorrect Module URLs
- **Location**: Initial navigation attempts
- **Priority**: Critical (now resolved)
- **Description**: Initial URLs used number prefixes (e.g., `/7.1-correlation-coefficient`) but actual URLs don't include numbers (e.g., `/correlation-coefficient`)
- **Technical Cause**: Mismatch between expected and actual routing patterns
- **Status**: Resolved - correct URLs identified

---

## Bug Summary

### Critical Issues (4 bugs):
- **Modules 7.3-7.6**: Complete lack of content - shows only home icon
  
### High Priority Issues (1 bug):
- **Module 7.2**: Mobile view shows navigation menu instead of content

### Medium Priority Issues (1 bug):
- **Module 7.1**: Text overflow on mobile viewport

### Low Priority Issues (1 bug):
- **Module 7.1**: Unexplained notification badge

### Total Bugs Found: 7

## Recommendations

1. **Immediate Action Required**: Implement content for modules 7.3-7.6 or fix routing issues
2. **Mobile Experience**: Fix responsive design issues affecting modules 7.1 and 7.2
3. **Testing**: Implement comprehensive testing for all viewport sizes
4. **Component Verification**: Ensure all module components are properly imported and routed

## Positive Highlights

- Modules 7.1 and 7.2 function well on desktop with proper LaTeX rendering
- Interactive visualizations work smoothly where implemented
- Navigation structure is clear and consistent
- Color scheme and visual design are professional