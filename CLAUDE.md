## Use LaTeX (see `/docs/latex-guide.md`)
## See `/docs/` folder for all best practices and guides. Claude will select relevant docs based on your task.
Make sure there are no build errors and all buttions and componets are wired up. 
Make sure the central hub make has a link to sub-chapters, and there is a standard back to hub button (this as been implemented in chapter 6)
Don't try to build a compoent from scratch, always use existing components ideas that have already been validated and tested.

I've found most interactions with draggable components that are super interactive have a LOT of bugs and it just distracts from the learning experience. We want animations, that are carefully curated that the users can control. And finally carefully read the best practices we have in /docs to ensure we are learning from out past mistakes and not repeating them.

Reflect ALL  possible sources of problems from different dimensions. For each issue you identity reflect on 5-7 possible sources or solutions of the problem, distill those down to 1-2 most likely sources and validate your assumptions before we begin implementing the actual code fixes. 
* Priority #1: Polish the User Interface for a Frictionless Experience
* Follow our ALL of our best practices for: dragging-best-practices.md and and latex-guide.md 
- No overlapping and cluttered UI. 
- All the animations are exceptionally smooth, use vibrant colours that match the aesthetic and use /Users/hananather/Desktop/Javascript/prob-lab/src/components/landing/landing-animations.jsx guidance on how to build great animations that we are using on the home page 

-Use a emojis sparingly.

1. Deep Analysis Phase
- Before writing any code, thoroughly analyze the problem:
- Break down the objective into core components
- Identify potential edge cases and constraints
- Consider multiple architectural approaches

2. Multi-Perspective Evaluation
- When tackling complex problems:
- Approach the issue from different angles (user experience, performance, maintainability, scalability)
- Consider trade-offs between different solutions

3. Simplicity First Principle

- Start with the simplest solution that could possibly work
- Add complexity only when proven necessary
- Prefer clarity over cleverness in implementation

4. Continuous Simplification Check
- At each decision point, ask:
- "Is this the simplest way to achieve our goal?"
- "What can we remove while maintaining functionality?"
- "Are we solving problems we don't actually have?"

5. Avoid Premature Optimization
- Don't over-engineer for hypothetical future requirements
- Build for current needs with reasonable flexibility
- Refactor when requirements actually change, not before

6. Implementation Only After Understanding
- Ensure you have a complete mental model of the solution
- Validate your approach against the requirements
- Have evaluated and compared multiple implementation strategies
- Can clearly articulate why your chosen approach is optimal



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


## Checklist
- Content shape drives layout
- 80-90% space usage
- Numbers in font-mono
- Progressive disclosure
- Hover states

## Commands
```bash
npm run dev                    # Start development server
npm run build                  # Build for production
npm run lint                   # Check code quality
npm run build && npm run lint  # Before commit
```

## Resources
See `/docs/` folder for all best practices and guides. Claude will select relevant docs based on your task.
