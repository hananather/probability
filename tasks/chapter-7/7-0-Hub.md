# Plan: 7.0 - Linear Regression and Correlation Hub

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
    *   **Pedagogy & Interaction:** `/src/components/01-introduction-to-probabilities/1-7-monty-hall/`
    *   **Hub Design:** `/src/components/04-descriptive-statistics-sampling/4-1-central-tendency/`
    *   **UI & Aesthetics:** `https://brilliant.org/wiki/best/`

---

## Hub Component Design

### 1. Opening Hook: The Prediction Challenge
*   **Interactive Visual Anchor:** 
    - Scatter plot with 20 points (hydrocarbon vs oxygen levels)
    - As user hovers, show coordinate values
    - Toggle to add/remove trend line
    - Real-time correlation coefficient display
*   **Core Question:** "Can we predict oxygen purity from hydrocarbon levels? How confident can we be in our predictions?"
*   **Quick Insight:** User sees points cluster around a hidden line, correlation ρ ≈ 0.94

### 2. Core Introduction
**What is Linear Regression?**
"Linear regression reveals relationships between variables, allowing us to predict one from another. It's the foundation of predictive modeling, from weather forecasting to stock market analysis."

**The Journey:**
- First, measure the relationship strength (correlation)
- Then, find the best prediction line (regression)
- Finally, quantify our confidence (intervals and tests)

### 3. Learning Journey Visualization
A visual progression showing:
```
Scatter Plot → Correlation → Best Fit Line → Predictions → Confidence
    (Data)     (Strength)    (Model)       (Application) (Reliability)
```

### 4. Section Links with Compelling Questions

*   **7.1 Coefficient of Correlation:**
    - "How do we measure the strength of a linear relationship?"
    - Preview: Interactive correlation explorer (-1 to +1)
    - Key Insight: ρ measures linear association, not causation

*   **7.2 Simple Linear Regression:**
    - "What's the best line through our data points?"
    - Preview: Least squares visualization
    - Key Insight: Minimize vertical distances squared

*   **7.3 Hypothesis Testing for Linear Regression:**
    - "Is the relationship real or just random noise?"
    - Preview: Significance test animation
    - Key Insight: Test if slope β₁ = 0

*   **7.4 Confidence and Prediction Intervals:**
    - "How precise are our predictions?"
    - Preview: Confidence bands visualization
    - Key Insight: CI for mean vs PI for individuals

*   **7.5 Analysis of Variance:**
    - "How much variation does our model explain?"
    - Preview: SST = SSR + SSE decomposition
    - Key Insight: F-test connection to t-test

*   **7.6 Coefficient of Determination:**
    - "What percentage of variation is explained?"
    - Preview: R² visualization
    - Key Insight: R² = correlation squared (for simple regression)

### 5. Key Concepts Summary Card
**The Regression Trinity:**
- **Model:** Y = β₀ + β₁X + ε
- **Estimation:** Least squares minimizes Σ(y - ŷ)²
- **Inference:** Test significance, build intervals

**Key Assumptions:**
- Linear relationship
- Constant variance
- Normal errors
- Independent observations

### 6. Interactive Motivating Example
**Fuel Quality Analysis:**
- Dataset: 20 fuel samples
- X: Hydrocarbon level (%)
- Y: Oxygen purity (%)
- Fitted line: ŷ = 74.28 + 14.95x
- R² = 0.877 (87.7% variance explained)

**Try It:** 
- Adjust a point and see correlation change
- Remove outliers and observe effect
- Predict purity for new hydrocarbon level

### 7. Progress Tracking
- Show completion status for each section
- Estimated time: 3-4 hours for full chapter
- Achievement: "Prediction Master" badge upon completion

---

**Reference Implementation:** `/src/components/04-descriptive-statistics-sampling/4-1-central-tendency/4-1-0-CentralTendencyHub.jsx`