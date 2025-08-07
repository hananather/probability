# Reference Sheet Overflow Fix

## Issue
Reference sheets for all chapters had formulas and content overflowing beyond the visible container area, making study material inaccessible.

## Root Cause
The `QuickReferenceCard.jsx` component had a fixed height constraint of `max-h-96` (384px) on line 48, which was insufficient for the extensive content in reference sheets (especially Chapter 1 with 310 lines of content).

## Investigation Process
Analyzed 7 potential causes:
1. **Container constraints** ✅ Primary cause - fixed max-h-96
2. LaTeX rendering expansion - Not the cause
3. Tab component interference - Not applicable
4. CSS overflow settings - Contributing factor
5. React rendering race conditions - Not the cause
6. Browser viewport calculations - Not the cause
7. Nested component height propagation - Contributing factor

## Solution Applied
Changed from fixed height to dynamic height based on display mode:
- **Embedded mode**: `max-h-[600px]` - Fixed but larger height for static display
- **Floating/Inline modes**: `max-h-[70vh]` - Viewport-relative for responsive sizing

## Code Change
File: `/src/components/ui/patterns/QuickReferenceCard.jsx` line 48-50
```jsx
// Before:
<div ref={contentRef} className="space-y-3 max-h-96 overflow-y-auto">

// After:
<div ref={contentRef} className={`space-y-3 overflow-y-auto ${
  mode === 'embedded' ? 'max-h-[600px]' : 'max-h-[70vh]'
}`}>
```

## Pattern Learned
When displaying variable-length content in containers:
- Avoid fixed pixel heights for content-heavy components
- Use viewport-relative units (vh) for responsive sizing
- Consider different constraints for different display modes
- Always test with maximum expected content volume