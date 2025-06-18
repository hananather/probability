/**
 * Unified Design System
 * Based on the clean aesthetic of ContinuousDistributionsPDF component
 */

export const colors = {
  // Background colors - using neutral palette for professional look
  background: {
    primary: 'bg-neutral-800',      // Main container background
    secondary: 'bg-neutral-900',    // Inner containers, graphs
    tertiary: 'bg-neutral-700',     // Input fields, controls
    hover: 'hover:bg-neutral-600',  // Hover states
  },
  
  // Text colors
  text: {
    primary: 'text-white',          // Main text
    secondary: 'text-neutral-300',  // Labels
    tertiary: 'text-neutral-400',   // Descriptions, hints
    accent: 'text-teal-400',        // Headers, important values
    highlight: 'text-yellow-400',   // Special values, highlights
    mono: 'font-mono',              // For numbers
  },
  
  // Border colors
  border: {
    primary: 'border-neutral-700',
    secondary: 'border-neutral-600',
  },
  
  // Chart colors (hex for D3/SVG)
  chart: {
    primary: '#14b8a6',    // Teal - main data
    secondary: '#eab308',  // Yellow - highlights, means
    tertiary: '#38a169',   // Green - comparisons
    error: '#ef4444',      // Red - errors, exclusions
    grid: '#374151',       // Grid lines
    text: '#ffffff',       // SVG text
    
    // Area fills with transparency
    primaryArea: 'rgba(20, 184, 166, 0.3)',
    secondaryArea: 'rgba(250, 204, 21, 0.5)',
    tertiaryArea: 'rgba(56, 161, 105, 0.3)',
  },
  
  // Interactive elements
  interactive: {
    slider: {
      track: 'bg-neutral-700',
      thumb: 'accent-teal-500',
      thumbAlt: 'accent-yellow-500',
    },
    button: {
      primary: 'bg-teal-600 hover:bg-teal-700 text-white',
      secondary: 'bg-neutral-700 hover:bg-neutral-600 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
    },
  },
};

export const spacing = {
  container: 'p-5',
  section: 'space-y-4',
  grid: 'gap-5',
  inline: 'gap-2',
};

export const typography = {
  // Headers
  h1: 'text-2xl font-bold text-teal-400',
  h2: 'text-xl font-semibold text-teal-400',
  h3: 'text-lg font-medium text-white',
  h4: 'text-base font-medium text-neutral-300',
  
  // Labels and values
  label: 'text-sm text-neutral-300',
  value: 'font-mono text-teal-400',
  valueAlt: 'font-mono text-yellow-400',
  description: 'text-sm text-neutral-400',
};

export const layout = {
  // Container styles
  container: 'bg-neutral-800 rounded-lg shadow-xl p-5',
  innerContainer: 'bg-neutral-900 rounded-md shadow-inner p-4',
  
  // Grid layouts
  gridMd2: 'grid md:grid-cols-2 gap-5',
  gridMd3: 'grid md:grid-cols-3 gap-4',
  
  // Sections
  section: 'space-y-4',
  sectionDivider: 'border-t border-neutral-700 pt-4',
};

export const components = {
  // Select/dropdown styling
  select: 'w-full bg-neutral-700 border border-neutral-600 rounded px-3 py-2 text-white focus:outline-none focus:border-teal-500',
  
  // Input styling
  input: 'bg-neutral-700 border border-neutral-600 rounded px-3 py-1.5 text-white focus:outline-none focus:border-teal-500',
  
  // Button styling
  button: {
    base: 'px-4 py-2 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800',
    primary: 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500',
    secondary: 'bg-neutral-700 hover:bg-neutral-600 text-white focus:ring-neutral-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    small: 'px-3 py-1.5 text-sm',
  },
  
  // Canvas/visualization container
  canvas: 'bg-neutral-900 rounded-md shadow-inner',
};

// Color schemes for different statistical concepts
export const colorSchemes = {
  default: {
    primary: '#14b8a6',    // Teal
    secondary: '#eab308',  // Yellow
    tertiary: '#3b82f6',   // Blue
    name: 'Default'
  },
  probability: {
    primary: '#3b82f6',    // Blue
    secondary: '#10b981',  // Emerald  
    tertiary: '#f59e0b',   // Amber
    name: 'Probability'
  },
  inference: {
    primary: '#3b82f6',    // Blue - posterior/evidence
    secondary: '#ef4444',  // Red - prior/hypothesis
    tertiary: '#8b5cf6',   // Purple - uncertainty
    name: 'Bayesian Inference'
  },
  estimation: {
    primary: '#f97316',    // Orange - estimates
    secondary: '#8b5cf6',  // Purple - true values
    tertiary: '#ec4899',   // Pink - variation
    name: 'Parameter Estimation'
  },
  hypothesis: {
    primary: '#10b981',    // Green - accept
    secondary: '#ef4444',  // Red - reject
    tertiary: '#eab308',   // Yellow - critical region
    name: 'Hypothesis Testing'
  },
  sampling: {
    primary: '#06b6d4',    // Cyan - samples
    secondary: '#a855f7',  // Purple - population
    tertiary: '#f59e0b',   // Amber - statistics
    name: 'Sampling & Bootstrapping'
  }
};

// Create a color scheme with consistent structure
export const createColorScheme = (scheme = 'default') => {
  const schemeColors = colorSchemes[scheme] || colorSchemes.default;
  
  return {
    // Chart colors (hex for D3/SVG)
    chart: {
      primary: schemeColors.primary,
      secondary: schemeColors.secondary,
      tertiary: schemeColors.tertiary,
      error: '#ef4444',      // Always red for errors
      success: '#10b981',    // Always green for success
      grid: '#374151',       // Always neutral
      text: '#ffffff',       // Always white
      
      // Area fills with transparency
      primaryArea: `${schemeColors.primary}4D`,     // 30% opacity
      secondaryArea: `${schemeColors.secondary}4D`, // 30% opacity
      tertiaryArea: `${schemeColors.tertiary}4D`,   // 30% opacity
      
      // Lighter versions for highlights
      primaryLight: `${schemeColors.primary}80`,    // 50% opacity
      secondaryLight: `${schemeColors.secondary}80`, // 50% opacity
    },
    
    // Interactive elements
    interactive: {
      slider: {
        track: 'bg-neutral-700',
        thumb: `accent-[${schemeColors.primary}]`,
        thumbAlt: `accent-[${schemeColors.secondary}]`,
      },
      button: {
        primary: `bg-[${schemeColors.primary}] hover:bg-[${schemeColors.primary}]/80 text-white`,
        secondary: 'bg-neutral-700 hover:bg-neutral-600 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
      },
    },
    
    // Text colors for inline elements
    text: {
      primary: `text-[${schemeColors.primary}]`,
      secondary: `text-[${schemeColors.secondary}]`,
      tertiary: `text-[${schemeColors.tertiary}]`,
    },
    
    // Chip colors for legend/indicators (using predefined Tailwind classes)
    chipColors: {
      primary: scheme === 'probability' ? 'bg-blue-500' : 
               scheme === 'hypothesis' ? 'bg-teal-500' : 
               scheme === 'inference' ? 'bg-blue-500' :
               scheme === 'estimation' ? 'bg-violet-500' :
               scheme === 'sampling' ? 'bg-cyan-500' : 'bg-teal-500',
      secondary: scheme === 'probability' ? 'bg-emerald-500' : 
                 scheme === 'hypothesis' ? 'bg-amber-500' : 
                 scheme === 'inference' ? 'bg-orange-500' :
                 scheme === 'estimation' ? 'bg-cyan-500' :
                 scheme === 'sampling' ? 'bg-amber-500' : 'bg-yellow-500',
      tertiary: scheme === 'probability' ? 'bg-amber-500' : 
                scheme === 'hypothesis' ? 'bg-orange-500' : 
                scheme === 'inference' ? 'bg-yellow-500' :
                scheme === 'estimation' ? 'bg-amber-500' :
                scheme === 'sampling' ? 'bg-yellow-500' : 'bg-blue-500',
    },
    
    // Additional colors
    success: '#10b981',  // Green for success states
  };
};

// Helper function to format numbers consistently
export const formatNumber = (value, decimals = 2) => {
  if (typeof value !== 'number') return '—';
  
  // For large integers, use comma formatting
  if (Number.isInteger(value) && value >= 1000) {
    return value.toLocaleString();
  }
  
  // For decimals, use fixed decimal places
  if (!Number.isInteger(value)) {
    return value.toFixed(decimals);
  }
  
  // For small integers, return as-is
  return value.toString();
};

// Helper function to combine classes
export const cn = (...classes) => classes.filter(Boolean).join(' ');