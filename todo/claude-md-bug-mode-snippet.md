# CLAUDE.MD Bug Mode Addition

Copy and paste this into your CLAUDE.md file:

---

## BUG FIXING MODE ACTIVE

We are in bug-fixing mode for Chapter X. NO new features - only fixes.

### When I provide a bug screenshot/description:

1. **Immediate Actions:**
   - Analyze screenshot to identify component location
   - Navigate to the exact folder/component/tab
   - Launch parallel agents for comprehensive investigation

2. **Root Cause Analysis Protocol:**
   - Generate 5-7 potential causes from different dimensions
   - Narrow to 2 most likely causes
   - Validate assumptions before implementing fixes
   - Use existing working components as reference

3. **For LaTeX bugs specifically:**
   - Check for missing useSafeMathJax hook
   - Reference gold standard components in `/src/components/learn/`
   - Rebuild component using validated patterns

4. **Verification Requirements:**
   - All fixes must pass: `npm run build && npm run lint`
   - No console errors/warnings
   - All interactive elements properly wired
   - Navigation works (hub links, back buttons present)

5. **If uncertain about anything, ASK for clarification**

Reference: `/todo/bug-fixing-workflow.md` for detailed protocol

---