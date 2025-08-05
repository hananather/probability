# Systematic Bug Audit Prompt Using Puppeteer

## Objective
Perform a comprehensive visual and functional bug audit of each chapter in the probability learning platform using Puppeteer automation.

## Instructions for Claude Code

### Initial Setup
1. Ensure dev server is running on http://localhost:3000
2. Create a new todo list file for the chapter being audited: `/todo/chapter-[N]-bugs.md`

### Systematic Audit Process

For each chapter (1-7), execute the following:

1. **Navigate to Chapter Hub**
   ```
   Navigate to http://localhost:3000/chapter[N] using Puppeteer
   Take screenshot named "chapter-[N]-hub-initial"
   ```

2. **Launch Parallel Sub-Agents**
   Launch 6 parallel sub-agents (one for each module in the chapter) with these tasks:
   - Sub-agent 1-6: Audit individual chapter sections
   - Each sub-agent should independently navigate to their assigned module
   - Collect bugs specific to their section

3. **Bug Categories to Check**
   Each sub-agent must evaluate:
   - **Visual Bugs**: Layout breaks, overlapping elements, missing UI components
   - **LaTeX Rendering**: Mathematical equations not displaying, incorrect formatting
   - **Interactive Elements**: Buttons/sliders/inputs not responding, drag-drop failures
   - **Console Errors**: JavaScript errors in browser console
   - **Mathematical Correctness**: Verify formulas and calculations are accurate
   - **Responsive Design**: Test at viewport widths: 375px (mobile), 768px (tablet), 1400px (desktop)

4. **Bug Documentation Format**
   For each bug found, document:
   ```markdown
   ## Bug #[number]: [Concise Bug Title]
   - **Location**: chapter[N]/section-[name]/component-[name]
   - **Priority**: Critical | High | Medium | Low
   - **Type**: Visual | Functional | Mathematical | Performance
   
   ### Description
   [One sentence describing what's wrong]
   
   ### Visual Evidence
   - Screenshot: [screenshot-name]
   - Console errors: [if any]
   
   ### How It Manifests
   - User action that triggers it
   - Expected vs actual behavior
   
   ### Technical Details
   - Component file: [exact file path]
   - Suspected cause: [based on code analysis]
   - Similar working component: [reference]
   
   ### Proposed Fix
   [Specific implementation plan referencing gold standard patterns]
   ```

5. **Priority Ratings**
   - **Critical**: App crashes, data loss, completely broken functionality
   - **High**: Major visual breaks, incorrect math, non-functional interactions
   - **Medium**: Minor visual issues, console warnings, suboptimal UX
   - **Low**: Cosmetic issues, enhancement opportunities

6. **Validation Steps**
   For each bug:
   - Verify it's reproducible (not a one-time glitch)
   - Check if it's already fixed in recent commits
   - Confirm it's not an intentional design choice
   - Test if the issue exists in similar components

### Execution Commands

```bash
# For each chapter, ask Claude:
"Audit Chapter [N] for bugs using Puppeteer. Launch 6 parallel sub-agents to check each module. Focus on visual bugs, LaTeX rendering, interactive elements, and mathematical correctness. Create detailed bug report in /todo/chapter-[N]-bugs.md"

# Specific module audit:
"Navigate to [specific module URL] and perform comprehensive bug check including visual issues, console errors, and mathematical accuracy. Take screenshots of any problems found."

# Cross-reference check:
"Compare this broken component with the gold standard at /src/components/learn/GoldStandardShowcase.jsx and identify pattern differences"
```

### Output Format
Create `/todo/chapter-[N]-bugs.md` with:
1. Chapter overview and total bug count
2. Bugs organized by module/section
3. Summary table with priorities
4. Recommended fix order based on dependencies

### Example Prompt for Chapter 7
```
"Audit Chapter 7 (Linear Regression) using Puppeteer. Navigate to http://localhost:3000/chapter7 and verify all 6 modules load correctly. Launch parallel sub-agents to check:
1. Simple Linear Regression
2. Correlation Coefficient  
3. Least Squares Method
4. Hypothesis Testing in Regression
5. Confidence & Prediction Intervals
6. Multiple Regression Basics

For each module, check for visual bugs, LaTeX rendering issues, interactive element failures, and mathematical correctness. Document all findings in /todo/chapter-7-bugs.md with priority ratings and fix proposals."
```

### Important Notes
- Ignore 404s for non-existent legacy routes (these aren't bugs)
- Focus only on components accessible from chapter hub pages
- Verify bugs are real issues, not artifacts from old code
- Reference `/docs/` guides for proper patterns
- Always compare with gold standard implementation