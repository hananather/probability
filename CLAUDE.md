Ultrathink. Use parallel tasks/agents to gather context for each of the bug we are attempting to resolve. 

We are fixing bugs only. No new features.

## When you receive a bug
1. Find the exact component from the screenshot/description
2. Launch parallel agents to investigate:
   - One to analyze the broken component
   - One to find similar working components
   - One to check relevant docs and patterns

## Analyze from multiple angles

For each bug, identify 5-7 potential causes (Use parallel tasks/agents to gather context). Then narrow to 2 most likely causes based on evidence.
Validate your hypothesis before coding.
Bugs:
- Find similar working component (/learn/GoldStandardShowcase.jsx)
- Copy its pattern exactly
- Check /docs/dragging-best-practices.md if relevant
- Don't create new solutions

## Verify the fix

Run: npm run build && npm run lint

Check:
- Bug is actually fixed
- No new errors introduced
- All buttons/interactions work
- No console errors

## If unsure about anything, ask

Don't guess about:
- Which component to modify
- What the bug actually is
- Whether a fix might break something else

## Document what you learned

After fixing, note:
- What was actually broken
- Why it was broken
- What pattern fixed it

This helps fix similar bugs faster next time.

after completing  a task update /Users/hananather/Desktop/Javascript/prob-lab/todo'                              │
Use LaTeX (see `/docs/latex-guide.md`)

## See `/docs/` folder for all best practices and guides. Claude will select relevant docs based on your task.

- Use a emojis sparingly.


## Commands
```bash
npm run dev                    # Start development server
npm run build                  # Build for production
npm run lint                   # Check code quality
npm run build && npm run lint  # Before commit
```

Use parallel tasks/agents to gather context for each of the bug we are attempting to resolve, find similar working component (/learn/GoldStandardShowcase.jsx)

## Resources
See `/docs/` folder for all best practices and guides. Claude will select relevant docs based on your task.
