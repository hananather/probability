# Plan: 7.4 - Confidence and Prediction Intervals (Improved)

### **Component Development Mandate**

**Guiding Philosophy: Rigorous, Beautiful, and Insightful Guided Discovery.**
Our goal is to create a learning experience that is as aesthetically beautiful and intellectually satisfying as it is mathematically rigorous. We are building the world's best interactive textbook, inspired by the clarity and elegance of platforms like `brilliant.org`. The priority is **optimal teaching**, not gamification.

**Core Mandates:**
1.  **Pedagogy First, Interaction Second:** The primary goal is to teach. Interactions must be purposeful, low-bug, and directly serve to build intuition. Prefer curated animations and controlled interactions over complex, bug-prone drag-and-drop interfaces.
2.  **Aesthetic Excellence & Brand Consistency:**
    *   **Internal Consistency is Key:** The new components for this chapter must feel like a natural extension of the existing ones. Use the color schemes, animation styles, and layout patterns already established in the codebase.
    *   **Typography & Layout:** Follow the established design system. Use `font-mono` for numbers, maintain clear visual hierarchies, and ensure layouts are clean, uncluttered, and content-driven.
3.  **Mathematical & Technical Rigor:**
    *   **Content:** All content must be derived from the official course materials for the relevant chapter, but examples must be generalized to be accessible to a broad university audience (science, social science, engineering, etc.).
    *   **LaTeX:** All mathematical notation must strictly adhere to the best practices outlined in `/docs/latex-guide.md`.
4.  **Reference Gold Standards:**
    *   **Pedagogy & Interaction:** `/src/components/05-continuous-random-variables/` (interval concepts)
    *   **Visual Design:** Confidence interval visualizations from earlier chapters
    *   **UI & Aesthetics:** `https://brilliant.org/wiki/best/`

---

**Component Type:** Guided Discovery Experience

**Guiding Philosophy:** This component builds intuition for the crucial distinction between CI and PI through visual comparison before introducing mathematical formulas.

---

### 1. Core Question

*   "When we predict Y for a given X, are we predicting the average of many values or just one specific value?"

---

### 2. Interactive Exploration

*   **Part A: Two Different Questions**
    
    *   **Scenario Introduction:**
        ```
        Quality Control Manager's Two Questions:
        
        Question 1: "What's the AVERAGE purity for ALL batches 
                    with 1.3% hydrocarbon?"
                    
        Question 2: "What purity will THIS SPECIFIC batch 
                    with 1.3% hydrocarbon have?"
        
        Same X = 1.3, but VERY different questions!
        ```
    
    *   **Visual Distinction:**
        ```
        Average (Many Batches)         Individual (One Batch)
        ┌─────────────────────┐       ┌─────────────────────┐
        │      ┊ • • • ┊      │       │      ┊     •   ┊    │
        │      ┊• • • •┊      │       │      ┊   •   • ┊    │
        │      ┊ • • • ┊      │       │      ┊ •   •   ┊    │
        │      ┊   μ   ┊      │       │      ┊   ?     ┊    │
        └─────────────────────┘       └─────────────────────┘
         x=1.3 (narrow range)          x=1.3 (wide range)
        ```

*   **Part B: Building Visual Intuition**
    
    *   **Interactive Demonstration:**
        ```
        At x₀ = 1.3:
        
        Point Estimate: ŷ = 93.72
        
        ├─────────────────────────────────────────┤
        91        92        93.72      95        96
        │         │          ●          │         │
        │         ├──────CI──────┤      │         │
        │         │   (for mean) │      │         │
        ├─────────────────PI─────────────────────┤
               (for individual value)
        
        CI: [92.84, 94.60] - Where the TRUE AVERAGE is
        PI: [91.25, 96.19] - Where ONE NEW VALUE might be
        ```
    
    *   **Key Visual Elements:**
        - CI shown as inner blue band
        - PI shown as outer green band
        - Point estimate as center dot
        - Clear labels and color coding

*   **Part C: The Funnel Effect**
    
    *   **Full Range Visualization:**
        ```
        Confidence & Prediction Intervals Across All X
        
        Y │     ╱──────────╲ ← PI (green)
          │   ╱────────────╲
          │ ╱──────CI───────╲ ← CI (blue)
          │╱─────────────────╲
          ├───────●───────────┤ ← Regression line
          │╲_________________╱
          │  ╲─────────────╱
          │    ╲─────────╱
          │      ╲─────╱
          └──────────────────── X
                  x̄
                  ↑
            Narrowest here!
        ```
    
    *   **Animation:**
        - Start at x = x̄ (narrowest)
        - Smoothly slide indicator left/right
        - Show intervals widening
        - Update numeric values

---

### 3. Facilitate Insight (The "Aha!" Moment)

*   **Key Insight 1: Why PI > CI Always**
    
    *   **Decomposition Visual:**
        ```
        Sources of Uncertainty:
        
        CI (Estimating Mean):          PI (Predicting Individual):
        ┌────────────────────┐        ┌────────────────────┐
        │ Estimation Error   │        │ Estimation Error   │
        │ ████████████       │        │ ████████████       │
        └────────────────────┘        │                    │
                                      │ + Individual      │
                                      │   Variation       │
                                      │ ████████████████   │
                                      └────────────────────┘
        
        PI = CI + Extra variation from individuals
        ```

*   **Key Insight 2: The Distance Effect**
    
    *   **Interactive Demo:**
        ```
        Uncertainty vs Distance from x̄:
        
        At x = x̄:      Close to x̄:     Far from x̄:
        ┌─────┐        ┌───────┐        ┌─────────────┐
        │ ███ │        │ █████ │        │ ███████████ │
        └─────┘        └───────┘        └─────────────┘
        Minimal        Moderate          Large
        
        "Predictions get less certain as we extrapolate!"
        ```

*   **Key Insight 3: Sample Size Effects**
    
    *   **Progressive Animation:**
        ```
        Effect of Sample Size on Intervals:
        
        n = 20 (Our Data):
        CI: ±0.88
        PI: ±2.47
        
        n = 100:
        CI: ±0.39 (much narrower!)
        PI: ±2.35 (barely changed!)
        
        n → ∞:
        CI: → 0 (we know the true line!)
        PI: → σ (individual variation remains!)
        ```

---

### 4. Connect to Rigor

*   **Mathematical Foundation (After Visual Understanding):**

    *   **Confidence Interval for Mean Response E[Y|x₀]:**
        ```
        ŷ₀ ± t_{α/2}(n-2) × SE(mean)
        
        where SE(mean) = σ̂√[1/n + (x₀-x̄)²/Sxx]
                             ↑       ↑
                         sampling  leverage
        ```
    
    *   **Prediction Interval for New Observation Y₀:**
        ```
        ŷ₀ ± t_{α/2}(n-2) × SE(individual)
        
        where SE(individual) = σ̂√[1 + 1/n + (x₀-x̄)²/Sxx]
                                  ↑     ↑       ↑
                              individual sampling leverage
        ```
    
    *   **The Key Difference:** The "1+" term for individual variation

*   **Fuel Data Example Calculations:**
    ```
    At x₀ = 1.3:
    
    1. Point estimate:
       ŷ₀ = 74.28 + 14.95(1.3) = 93.72
    
    2. Components:
       σ̂ = 1.087
       (x₀ - x̄)² = (1.3 - 1.2)² = 0.01
       Sxx = 0.68
    
    3. Standard errors:
       SE(mean) = 1.087√[1/20 + 0.01/0.68] = 0.42
       SE(individual) = 1.087√[1 + 1/20 + 0.01/0.68] = 1.18
    
    4. 95% Intervals (t₀.₀₂₅(18) = 2.10):
       CI: 93.72 ± 2.10(0.42) = [92.84, 94.60]
       PI: 93.72 ± 2.10(1.18) = [91.25, 96.19]
    ```

*   **Practical Interpretations:**
    ```
    CI Interpretation:
    "We're 95% confident the TRUE AVERAGE purity 
     for all batches with 1.3% hydrocarbon 
     is between 92.84 and 94.60"
    
    PI Interpretation:
    "We're 95% confident the NEXT INDIVIDUAL batch 
     with 1.3% hydrocarbon will have purity 
     between 91.25 and 96.19"
    ```

*   **Common Applications:**
    ```
    Use CI when:
    • Setting quality standards
    • Estimating process averages
    • Comparing group means
    
    Use PI when:
    • Accepting/rejecting individual items
    • Setting warranty limits
    • Making individual predictions
    ```

---

### 5. Implementation Notes

**Visual Design Principles:**
- CI: Blue band (#3b82f6) with 50% opacity
- PI: Green band (#10b981) with 30% opacity
- Regression line: Black (#000000) solid
- Point estimate: Orange dot (#f59e0b)
- Clear visual hierarchy: PI > CI > line

**Animation Details:**
- Smooth transitions using CSS transitions
- X-position slider with throttled updates (60fps)
- Interval calculations cached for performance
- Total animation time: <100ms per update

**Interactive Elements:**
1. **X-Position Slider:** 
   - Range: [min(X) - 0.1, max(X) + 0.1]
   - Shows extrapolation warning outside data range
   - Updates intervals in real-time

2. **Confidence Level Selector:**
   - Options: 90%, 95%, 99%
   - Shows how intervals change
   - Maintains visual distinction

3. **Sample Size Demo:**
   - Pre-calculated for n = 10, 20, 50, 100, 500
   - Animated transition between sizes
   - Emphasizes CI vs PI behavior

**Accessibility:**
- Clear color contrast for colorblind users
- Numeric values always displayed
- Keyboard controls for slider
- Screen reader descriptions

---

**Reference Implementation:** This component combines interval visualization patterns from continuous distributions with the clarity of hypothesis testing visuals, prioritizing conceptual understanding before mathematical detail.