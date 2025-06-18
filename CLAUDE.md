# Claude.md

## Project
Educational statistics platform with interactive visualizations.

## Core Principles
1. **Educational First**: Every feature teaches
2. **Simplicity**: Reduce code, be concise
3. **Mathematical Rigor**: Use LaTeX (see `/docs/latex-guide.md`)

## Use Existing Components
- **Progress bars**: `/src/components/ui/ProgressBar.jsx`
- **Buttons**: `/src/components/ui/button.jsx`
- Never create inline UI elements

## Design Principles

1. **Content-first**: Let content shape layout
2. **80-90% rule**: Visualizations fill their space
3. **Layout by content type**:
   - Wide content → Horizontal layout
   - Tall content → Vertical flow
   - Dense data → Grid
   - Single focus → Hero with minimal controls

## Visual System

**Typography**: Headers (text-lg), Labels (text-sm), Numbers (font-mono), Max 3 sizes

**Spacing**: Sections (p-3/p-4), Between controls (space-y-3), Major gaps (gap-4/gap-6)

**Colors**: Bright for data, semantic for status, clear hover states

## Layout Patterns

1. **Exploration**: Large viz (80-90%) + minimal controls
2. **Progressive**: Viz + insights revealed at milestones  
3. **Guided**: Step 1 → Step 2 → Step 3
4. **Comparison**: Side-by-side views + shared controls

## Good Examples
See Chapter 1 and 2 components

## Checklist
- Content shape drives layout
- 80-90% space usage
- Numbers in font-mono
- Progressive disclosure
- Hover states

## Commands
```bash
npm run dev                    # Start
npm run build && npm run lint  # Before commit
```

## Resources
See `/docs/` folder for all best practices and guides. Claude will select relevant docs based on your task.
