# Plan: 6.0 - Hypothesis Testing Hub

### **Component Development Mandate**

**Guiding Philosophy: Rigorous, Beautiful, and Insightful Guided Discovery.**
Our goal is to create a learning experience that is as aesthetically beautiful and intellectually satisfying as it is mathematically rigorous. We are building the world's best interactive textbook, inspired by the clarity and elegance of platforms like `brilliant.org`. The priority is **optimal teaching**, not gamification.

**Core Mandates:**
1.  **Pedagogy First, Interaction Second:** The primary goal is to teach. Interactions must be purposeful, low-bug, and directly serve to build intuition. Prefer curated animations and controlled interactions over complex, bug-prone drag-and-drop interfaces.
2.  **Aesthetic Excellence & Brand Consistency:**
    *   **Internal Consistency is Key:** The new components for this chapter must feel like a natural extension of the existing ones. Use the color schemes, animation styles, and layout patterns already present in `/src/components/06-hypothesis-testing/` as the primary source of truth for UI/UX design.
    *   **Typography & Layout:** Follow the established design system. Use `font-mono` for numbers, maintain clear visual hierarchies, and ensure layouts are clean, uncluttered, and content-driven.
3.  **Mathematical & Technical Rigor:**
    *   **Content:** All content must be derived from the official course materials for the relevant chapter, but examples must be generalized to be accessible to a broad university audience (science, social science, engineering, etc.).
    *   **LaTeX:** All mathematical notation must strictly adhere to the best practices outlined in `/docs/latex-guide.md`.
4.  **Reference Gold Standards:**
    *   **Pedagogy & Interaction:** `/src/components/01-introduction-to-probabilities/1-7-monty-hall/`
    *   **Hub Design:** `/src/components/04-descriptive-statistics-sampling/4-1-central-tendency/`
    *   **UI & Aesthetics:** `https://brilliant.org/wiki/best/`

---

## Hub Component Design

### 1. Opening Hook: The Coin Scenario
*   **Interactive Visual Anchor:** An animated coin that flips when clicked, showing heads/tails results
*   **Scenario Setup:** "Person A claims they have a fair coin, but Person B is suspicious, believing it's biased toward tails..."
*   **Quick Demo:** User flips the coin 10 times, sees 4 heads. Text shows: "Is this evidence of bias? Let's discover how to answer questions like this scientifically."

### 2. Core Introduction
**What is Hypothesis Testing?**
"Hypothesis testing is a systematic method for evaluating claims using data. Instead of relying on gut feelings, we use probability to determine when evidence is strong enough to challenge a claim."

### 3. Learning Journey Visualization
A visual roadmap showing the progression through the chapter:
- Start with fundamentals (what is a hypothesis?)
- Build to single-sample tests (testing one claim)
- Advance to two-sample tests (comparing groups)
- Each section shows estimated time and key skill unlocked

### 4. Section Links with Compelling Questions

*   **6.1 Hypothesis Testing Fundamentals:** 
    - "How do we turn suspicions into testable claims?"
    - Preview: Interactive p-value visualization
    
*   **6.2 Types of Hypotheses:** 
    - "Does it matter if we're looking for any change vs. a specific direction?"
    - Preview: One-tailed vs. two-tailed test comparison
    
*   **6.3 Errors & Power:** 
    - "What's worse: convicting the innocent or letting the guilty go free?"
    - Preview: Type I/II error trade-off visualization
    
*   **6.4 Test for a Mean (Known Variance):** 
    - "Is the manufacturing process producing the claimed quality?"
    - Preview: Z-test calculator with critical regions
    
*   **6.5 Test for a Mean (Unknown Variance):** 
    - "What if we don't know the population's variability?"
    - Preview: t-distribution emergence animation
    
*   **6.6 Test for a Proportion:** 
    - "Has the politician's approval rating really changed?"
    - Preview: Proportion sampling distribution
    
*   **6.7 Paired Two-Sample Test:** 
    - "Did the training course actually improve performance?"
    - Preview: Before/after difference visualization
    
*   **6.8 Unpaired Two-Sample Test:** 
    - "Which teaching method produces better results?"
    - Preview: Two independent distributions comparison
    
*   **6.9 Difference of Two Proportions:** 
    - "Is the marketing campaign more effective in one city?"
    - Preview: Proportion difference distribution

### 5. Key Concepts Summary Card
A clean card showing:
- **Null Hypothesis (H₀):** The claim we're testing
- **Alternative Hypothesis (H₁):** What we suspect is true
- **p-value:** Probability of seeing our data if H₀ is true
- **Significance Level (α):** Our threshold for "rare enough"

### 6. Progress Tracking
- Show completion status for each section
- Estimated total time: 2-3 hours for full chapter
- Achievement unlocked: "Statistical Detective" badge upon completion

---

**Reference Implementation:** `/src/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-0-CentralTendencyHub.jsx`