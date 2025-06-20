// ==================== DISTRIBUTION DESIGN SYSTEM ====================

/**
 * Unified design system for all distribution visualizations
 * Provides consistent themes, colors, animations, and styles
 */

// Color palettes for each distribution
export const distributionThemes = {
  binomial: {
    name: 'Binomial',
    primary: '#14b8a6', // teal-500
    secondary: '#2dd4bf', // teal-400
    accent: '#0d9488', // teal-600
    light: '#5eead4', // teal-300
    dark: '#0f766e', // teal-700
    gradient: 'from-teal-400 to-teal-600',
    success: '#10b981', // emerald-500
    failure: '#6b7280', // gray-500
    hover: 'hover:from-teal-500 hover:to-teal-700',
    shadow: 'shadow-teal-500/30'
  },
  geometric: {
    name: 'Geometric',
    primary: '#f97316', // orange-500
    secondary: '#fb923c', // orange-400
    accent: '#ea580c', // orange-600
    light: '#fed7aa', // orange-200
    dark: '#c2410c', // orange-700
    gradient: 'from-orange-400 to-orange-600',
    success: '#10b981', // green-500
    failure: '#6b7280', // gray-500
    hover: 'hover:from-orange-500 hover:to-orange-700',
    shadow: 'shadow-orange-500/50'
  },
  negativeBinomial: {
    name: 'Negative Binomial',
    primary: '#8b5cf6', // violet-500
    secondary: '#a78bfa', // violet-400
    accent: '#7c3aed', // violet-600
    light: '#ede9fe', // violet-100
    dark: '#6d28d9', // violet-700
    gradient: 'from-violet-400 to-violet-600',
    success: '#10b981', // green-500
    failure: '#6b7280', // gray-500
    milestone: '#fbbf24', // amber-400
    hover: 'hover:from-violet-500 hover:to-violet-700',
    shadow: 'shadow-violet-500/50'
  },
  poisson: {
    name: 'Poisson',
    primary: '#10b981', // emerald-500
    secondary: '#34d399', // emerald-400
    accent: '#059669', // emerald-600
    light: '#d1fae5', // emerald-100
    dark: '#047857', // emerald-700
    gradient: 'from-emerald-400 to-emerald-600',
    event: '#fbbf24', // amber-400
    window: '#3b82f6', // blue-500
    hover: 'hover:from-emerald-500 hover:to-emerald-700',
    shadow: 'shadow-emerald-500/50'
  }
};

// Shared button styles
export const buttonStyles = {
  base: 'px-4 py-2 rounded-lg font-medium transition-all duration-300 transform active:scale-95',
  primary: (theme) => `
    bg-gradient-to-r ${theme.gradient} 
    text-white 
    ${theme.hover} 
    shadow-lg ${theme.shadow}
    hover:shadow-xl hover:scale-105
  `,
  secondary: (theme) => `
    bg-white 
    border-2 border-${theme.primary} 
    text-${theme.primary}
    hover:bg-${theme.light}
    hover:shadow-md
  `,
  icon: (theme) => `
    p-2 rounded-full 
    bg-gradient-to-r ${theme.gradient}
    text-white
    ${theme.hover}
    shadow-md hover:shadow-lg
  `,
  disabled: 'opacity-50 cursor-not-allowed hover:scale-100'
};

// Animation configurations
export const animations = {
  // Timing functions
  duration: {
    instant: 0,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 1000
  },
  
  // Easing functions
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
  },
  
  // Keyframe animations
  keyframes: {
    pulse: 'distributionPulse 2s infinite',
    bounce: 'distributionBounce 1s infinite',
    glow: 'distributionGlow 2s infinite',
    slideIn: 'distributionSlideIn 0.5s ease-out',
    fadeIn: 'distributionFadeIn 0.5s ease-out',
    
    // Success animation for outcomes
    success: `
      @keyframes successPulse {
        0% { transform: scale(0.8); opacity: 0; }
        50% { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
    `,
    
    // Coin flip animation
    coinFlip: `
      @keyframes coinFlip {
        0% { transform: rotateY(0deg); }
        50% { transform: rotateY(1800deg) scale(1.1); }
        100% { transform: rotateY(3600deg); }
      }
    `,
    
    // Event appear animation
    eventAppear: `
      @keyframes eventAppear {
        0% { transform: scale(0) translateY(20px); opacity: 0; }
        60% { transform: scale(1.2) translateY(-5px); opacity: 1; }
        100% { transform: scale(1) translateY(0); opacity: 1; }
      }
    `
  }
};

// Chart styling configurations
export const chartStyles = {
  // Bar styles
  bar: {
    base: 'transition-all duration-300',
    hover: 'hover:brightness-110 hover:scale-105',
    active: 'brightness-125 scale-110',
    shadow: 'filter drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
  },
  
  // Grid and axis styles
  grid: {
    color: '#e5e7eb',
    strokeDasharray: '2,2',
    opacity: 0.5
  },
  
  axis: {
    color: '#6b7280',
    fontSize: '12px',
    labelColor: '#4b5563',
    labelFontSize: '14px'
  },
  
  // Tooltip styles
  tooltip: {
    background: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
  }
};

// Gradient definitions for SVG
export const gradientDefinitions = (theme) => `
  <defs>
    <linearGradient id="${theme.name}-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${theme.secondary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${theme.accent};stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="${theme.name}-gradient-horizontal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${theme.secondary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${theme.accent};stop-opacity:1" />
    </linearGradient>
    
    <radialGradient id="${theme.name}-gradient-radial">
      <stop offset="0%" style="stop-color:${theme.light};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${theme.primary};stop-opacity:1" />
    </radialGradient>
    
    <filter id="${theme.name}-glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <filter id="${theme.name}-shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
`;

// Responsive breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
};

// Layout configurations
export const layouts = {
  // Standard component padding
  padding: {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  },
  
  // Spacing between elements
  spacing: {
    controls: 'space-y-3',
    sections: 'space-y-6',
    items: 'gap-2',
    large: 'gap-4'
  },
  
  // Grid layouts
  grid: {
    controls: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    stats: 'grid grid-cols-2 md:grid-cols-4 gap-4',
    comparison: 'grid grid-cols-1 lg:grid-cols-2 gap-6'
  }
};

// Typography scales
export const typography = {
  // Headers
  h1: 'text-2xl font-bold',
  h2: 'text-xl font-semibold',
  h3: 'text-lg font-medium',
  
  // Body text
  body: 'text-base',
  small: 'text-sm',
  tiny: 'text-xs',
  
  // Special text
  mono: 'font-mono',
  label: 'text-sm font-medium text-gray-700',
  value: 'font-mono text-lg',
  
  // Mathematical text
  math: 'font-mono italic'
};

// Interaction states
export const states = {
  hover: {
    scale: 'hover:scale-105',
    brightness: 'hover:brightness-110',
    shadow: 'hover:shadow-lg',
    opacity: 'hover:opacity-100'
  },
  
  active: {
    scale: 'active:scale-95',
    brightness: 'active:brightness-90'
  },
  
  focus: {
    outline: 'focus:outline-none focus:ring-2 focus:ring-offset-2',
    ring: (theme) => `focus:ring-${theme.primary}`
  },
  
  disabled: {
    opacity: 'opacity-50',
    cursor: 'cursor-not-allowed',
    events: 'pointer-events-none'
  }
};

// Utility function to get theme-specific styles
export const getThemeStyles = (distributionType) => {
  const theme = distributionThemes[distributionType] || distributionThemes.binomial;
  
  return {
    theme,
    button: {
      primary: buttonStyles.base + ' ' + buttonStyles.primary(theme),
      secondary: buttonStyles.base + ' ' + buttonStyles.secondary(theme),
      icon: buttonStyles.icon(theme),
      disabled: buttonStyles.base + ' ' + buttonStyles.disabled
    },
    chart: chartStyles,
    animations,
    layouts,
    typography,
    states
  };
};

// Export a hook for easy theme usage in components
export const useDistributionTheme = (distributionType) => {
  return getThemeStyles(distributionType);
};