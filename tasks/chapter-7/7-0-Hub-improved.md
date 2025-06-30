# Plan: 7.0 - Linear Regression and Correlation Hub (Improved)

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

**Visual Anchor (80% of viewport):**
```
┌─────────────────────────────────────────────┐
│                                             │
│    •         Fuel Quality Analysis          │
│      •   •                                  │
│    •   •   •     [Animate: Points appear   │
│      •   •   •    one by one]              │
│    •   •   •   •                           │
│      •   •   •                             │
│        •   •                               │
│          •                                 │
│                                            │
│  Hydrocarbon Level (%) →                   │
└─────────────────────────────────────────────┘
```

**Core Question:** "Can we predict fuel purity from hydrocarbon levels?"

**Initial Animation Sequence:**
1. Points fade in progressively (2s)
2. Highlight pattern emerges (1s)  
3. Correlation value appears: ρ = 0.937
4. Question appears: "What's the best prediction line?"

### 2. Dataset Introduction

**The Complete Dataset Card:**
```
Fuel Quality Dataset (n = 20 samples)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
X: Hydrocarbon Level (%)
   Range: [0.99, 1.52]
   Mean: x̄ = 1.20
   
Y: Purity Index
   Range: [88.3, 94.3]  
   Mean: ȳ = 92.16

Key Statistics:
• Sxx = 0.68
• Sxy = 10.18
• Syy = 173.38
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Learning Path Visualization

**Progressive Concept Building:**
```
Your Learning Journey:

Foundation          Analysis           Validation
─────────────      ─────────────      ─────────────
1. Correlation     3. Hypothesis      5. ANOVA
   ρ = ?              Testing            Decomposition
   ↓                  ↓                  ↓
2. Regression      4. Confidence      6. R² Quality
   ŷ = b₀ + b₁x       Intervals          Assessment

[────────────────────────────────────────────────]
                  Click any box to begin
```

### 4. Section Previews with Key Insights

**Interactive Section Cards:**

#### 7.1 Correlation Coefficient
```
Preview Animation: Scatter plot morphing from ρ = -1 to +1
Key Question: "How strong is the linear relationship?"
You'll Learn: Calculate & interpret correlation
Time: 30 min
```

#### 7.2 Simple Linear Regression  
```
Preview Animation: Best-fit line emerging from points
Key Question: "What's the equation of the best line?"
You'll Learn: Derive ŷ = 74.28 + 14.95x
Time: 45 min
```

#### 7.3 Hypothesis Testing
```
Preview Animation: Null hypothesis scatter vs real data
Key Question: "Is this relationship real or random chance?"
You'll Learn: Test H₀: β₁ = 0 with t = 11.35
Time: 30 min
```

#### 7.4 Confidence & Prediction Intervals
```
Preview Animation: Funnel-shaped bands around line
Key Question: "How precise are our predictions?"
You'll Learn: Why PI > CI always
Time: 40 min
```

#### 7.5 Analysis of Variance
```
Preview Animation: Total variation splitting into parts
Key Question: "Where does the variation come from?"
You'll Learn: SST = SSR + SSE decomposition
Time: 35 min
```

#### 7.6 Coefficient of Determination
```
Preview Animation: Pie chart showing 87.7% explained
Key Question: "How good is our model?"
You'll Learn: R² interpretation and limitations
Time: 30 min
```

### 5. Interactive Motivator

**Try It Now: Make a Prediction**
```
New fuel batch arrives with 1.35% hydrocarbon
What's your predicted purity?

[Slider: Adjust hydrocarbon level]
     0.99 ──────●────── 1.52
              1.35

Prediction: ŷ = 74.28 + 14.95(1.35) = 94.46

But wait... how confident should you be?
→ Learn more in Section 7.4
```

### 6. Key Concepts Summary

**The Big Picture:**
```
Linear Regression Toolkit:
┌─────────────────────────────────────┐
│ 1. Measure: Correlation (ρ)         │
│ 2. Model: ŷ = b₀ + b₁x             │
│ 3. Test: Is β₁ ≠ 0?                │
│ 4. Predict: With intervals          │
│ 5. Evaluate: R² quality             │
└─────────────────────────────────────┘
```

### 7. Implementation Notes

**Animation Choreography:**
- Use `requestAnimationFrame` for smooth transitions
- Stagger point appearances (50ms each)
- Ease-in-out for all movements
- Total load animation: 3s max

**Performance Optimization:**
- Pre-calculate all regression statistics
- Use CSS transforms for animations
- Debounce slider interactions (100ms)
- Lazy load section components

**Accessibility:**
- All animations respect `prefers-reduced-motion`
- Keyboard navigation between sections
- ARIA labels for all interactive elements
- High contrast mode support

**Visual Consistency:**
- Primary: Blue (#2563eb) for data points
- Secondary: Green (#10b981) for regression line
- Accent: Orange (#f59e0b) for highlights
- Error: Red (#ef4444) for residuals
- Background: Subtle gray (#f9fafb)

---

**Reference Implementation:** This hub combines the navigation structure of Chapter 4 hub with the visual polish of Monty Hall component.