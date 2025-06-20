# Component Specification: RegressionExplorer

## Overview
Interactive visualization for exploring correlation and simple linear regression concepts from Chapter 7.1-7.2.

## Educational Objectives
From MAT 2377 course materials:
1. Understand the relationship between two quantitative variables
2. Calculate and interpret correlation coefficient
3. Fit a least squares regression line
4. Understand residuals and their meaning
5. Recognize patterns in scatter plots

## Core Features

### 1. Interactive Scatter Plot
- **Canvas area**: 800x600px main visualization
- **Axes**: Clearly labeled X and Y with grid lines
- **Points**: 
  - Draggable data points (10-50 points)
  - Add/remove points by clicking
  - Highlight on hover
  - Color coding for residuals (positive/negative)

### 2. Real-time Calculations
Display live updates for:
- **Correlation coefficient (r)**: Color-coded from -1 to 1
- **Regression equation**: y = β₀ + β₁x
- **R² value**: With interpretation
- **Sum of squares**: SST, SSR, SSE

### 3. Controls Panel
- **Data Generation**:
  - Correlation strength slider (-1 to 1)
  - Sample size selector (10-50)
  - Add outlier button
  - Reset to original data
  
- **Display Options**:
  - Toggle regression line
  - Toggle residual lines
  - Toggle confidence bands
  - Show/hide grid

### 4. Educational Insights (4 stages)
Following CLTSimulation pattern:

**Stage 1: First Points (2-5 points)**
"With just a few points, the regression line is heavily influenced by each point. Try moving one!"

**Stage 2: Pattern Emerging (10+ points)**
"As we add more points, the pattern becomes clearer. The correlation coefficient r = [value] indicates [strength] [direction] relationship."

**Stage 3: Understanding Residuals**
"The vertical lines show residuals - the difference between observed and predicted values. The regression line minimizes the sum of squared residuals."

**Stage 4: Interpretation**
"R² = [value] means [percentage]% of the variation in Y is explained by X. The remaining variation is due to other factors."

## Visual Design

### Layout
```
+------------------+------------------+
|                  |                  |
|                  |  Statistics      |
|   Scatter Plot   |  - r = 0.85     |
|   with           |  - R² = 0.72    |
|   Regression     |  - y = 2.1x+3.5 |
|                  |                  |
+------------------+------------------+
|                                     |
|          Controls Panel             |
|                                     |
+-------------------------------------+
|          Educational Insights       |
+-------------------------------------+
```

### Color Scheme
- Positive correlation: Blue gradient
- Negative correlation: Red gradient  
- Regression line: Black with 2px stroke
- Residuals: 
  - Positive: Green lines
  - Negative: Red lines
- Confidence bands: Light gray fill

## Mathematical Formulas to Display

### Correlation Coefficient
```latex
r = \frac{\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^{n}(x_i - \bar{x})^2}\sqrt{\sum_{i=1}^{n}(y_i - \bar{y})^2}}
```

### Regression Line
```latex
\hat{y} = \beta_0 + \beta_1 x
```

Where:
```latex
\beta_1 = r \frac{s_y}{s_x}, \quad \beta_0 = \bar{y} - \beta_1\bar{x}
```

### Coefficient of Determination
```latex
R^2 = \frac{SSR}{SST} = 1 - \frac{SSE}{SST}
```

## Example Problems from Course

### Example 1: Hydrocarbon and Oxygen Levels
From course page 3-4:
```
x: 0.99, 1.02, 1.15, 1.29, 1.46, 1.36, 0.87, 1.23, 1.55, 1.40
y: 90.01, 89.05, 91.43, 93.74, 96.73, 94.45, 87.59, 91.77, 99.42, 93.65
```
Pre-load this as "Course Example" dataset.

### Example 2: Generate Different Patterns
Preset buttons for:
- Strong positive (r ≈ 0.9)
- Strong negative (r ≈ -0.9)
- Weak positive (r ≈ 0.3)
- No correlation (r ≈ 0)
- Non-linear pattern

## Interactive Features

### Point Interaction
- **Drag**: Updates regression in real-time
- **Click empty space**: Add new point
- **Right-click point**: Remove point
- **Hover**: Show coordinates and residual

### Keyboard Shortcuts
- `R`: Toggle regression line
- `G`: Toggle grid
- `C`: Clear all points
- `Space`: Pause/resume animation

## Tutorial Content

### Step 1: Introduction
"Welcome to the Regression Explorer! This tool helps you understand how two variables relate to each other. Start by clicking anywhere on the plot to add points."

### Step 2: Correlation
"The correlation coefficient r measures the strength and direction of the linear relationship. Values close to 1 or -1 indicate strong relationships."

### Step 3: Regression Line
"The blue line is the 'line of best fit' - it minimizes the sum of squared vertical distances from all points to the line."

### Step 4: Making Predictions
"Once we have a regression line, we can make predictions. Click on the line to see predicted Y values for any X."

## Technical Implementation Notes

### Performance Considerations
- Use D3.js for efficient rendering
- Debounce calculations during dragging
- Limit to 50 points for smooth interaction
- Use CSS transforms for point dragging

### Accessibility
- Keyboard navigation for all controls
- ARIA labels for statistics
- High contrast mode option
- Screen reader announcements for value changes

### State Management
```javascript
const [points, setPoints] = useState([]);
const [showRegression, setShowRegression] = useState(true);
const [showResiduals, setShowResiduals] = useState(false);
const [statistics, setStatistics] = useState({
  r: 0,
  r2: 0,
  slope: 0,
  intercept: 0,
  sse: 0,
  ssr: 0,
  sst: 0
});
```

## Success Criteria
1. Students can explain what correlation means
2. Students understand least squares principle
3. Students can interpret R² values
4. Students recognize when linear regression is appropriate
5. Component loads in < 2 seconds
6. All interactions feel smooth (60 fps)