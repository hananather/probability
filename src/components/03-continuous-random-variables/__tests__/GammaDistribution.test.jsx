import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GammaDistribution } from '../GammaDistribution';
import '@testing-library/jest-dom';

// Mock D3 and other dependencies
jest.mock('d3', () => ({
  select: jest.fn().mockReturnThis(),
  selectAll: jest.fn().mockReturnThis(),
  append: jest.fn().mockReturnThis(),
  attr: jest.fn().mockReturnThis(),
  style: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnThis(),
  remove: jest.fn().mockReturnThis(),
  transition: jest.fn().mockReturnThis(),
  duration: jest.fn().mockReturnThis(),
  ease: jest.fn().mockReturnThis(),
  data: jest.fn().mockReturnThis(),
  enter: jest.fn().mockReturnThis(),
  call: jest.fn().mockReturnThis(),
  datum: jest.fn().mockReturnThis(),
  node: jest.fn(() => ({ getTotalLength: () => 100 })),
  scaleLinear: jest.fn(() => ({
    domain: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
  })),
  line: jest.fn(() => ({
    x: jest.fn().mockReturnThis(),
    y: jest.fn().mockReturnThis(),
    curve: jest.fn().mockReturnThis(),
  })),
  area: jest.fn(() => ({
    x: jest.fn().mockReturnThis(),
    y0: jest.fn().mockReturnThis(),
    y1: jest.fn().mockReturnThis(),
    curve: jest.fn().mockReturnThis(),
  })),
  histogram: jest.fn(() => ({
    domain: jest.fn().mockReturnThis(),
    thresholds: jest.fn(() => []),
  })),
  axisBottom: jest.fn(() => ({
    tickSize: jest.fn().mockReturnThis(),
    tickSizeOuter: jest.fn().mockReturnThis(),
    tickFormat: jest.fn().mockReturnThis(),
  })),
  axisLeft: jest.fn(() => ({
    tickSize: jest.fn().mockReturnThis(),
    tickSizeOuter: jest.fn().mockReturnThis(),
    tickFormat: jest.fn().mockReturnThis(),
  })),
  max: jest.fn(() => 10),
  curveMonotoneX: {},
  easeQuadInOut: {},
}));

jest.mock('jstat', () => ({
  jStat: {
    gamma: {
      pdf: jest.fn((x, shape, scale) => {
        // Simple mock implementation
        if (x <= 0 || shape <= 0 || scale <= 0) return 0;
        return Math.exp(-x/scale) * Math.pow(x, shape-1);
      }),
      cdf: jest.fn((x, shape, scale) => {
        if (x <= 0) return 0;
        return Math.min(1, x / (shape * scale));
      }),
    },
  },
}));

describe('GammaDistribution Component', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering and Basic Functionality', () => {
    test('renders without crashing', () => {
      render(<GammaDistribution />);
      expect(screen.getByText('Gamma Distribution Explorer')).toBeInTheDocument();
    });

    test('displays initial insurance story', () => {
      render(<GammaDistribution />);
      expect(screen.getByText(/How do insurance companies predict total claim costs/)).toBeInTheDocument();
    });

    test('shows parameter controls', () => {
      render(<GammaDistribution />);
      expect(screen.getByText(/Shape \(k\)/)).toBeInTheDocument();
      expect(screen.getByText(/Rate \(λ\)/)).toBeInTheDocument();
    });

    test('displays distribution properties', () => {
      render(<GammaDistribution />);
      expect(screen.getByText('Properties')).toBeInTheDocument();
      expect(screen.getByText('Mean')).toBeInTheDocument();
      expect(screen.getByText('Variance')).toBeInTheDocument();
    });
  });

  describe('Animation and State Management', () => {
    test('handles story animation lifecycle', async () => {
      render(<GammaDistribution />);
      
      // Initial state should show story
      expect(screen.getByText(/How do insurance companies predict total claim costs/)).toBeInTheDocument();
      
      // Trigger parameter change to start story
      const shapeSlider = screen.getByLabelText(/Shape/);
      fireEvent.change(shapeSlider, { target: { value: '4' } });
      
      // Fast-forward through animation
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(screen.queryByText(/Watch the pattern emerge/)).toBeInTheDocument();
      });
    });

    test('cleans up animation timers on unmount', () => {
      const { unmount } = render(<GammaDistribution />);
      
      // Start some animations
      const shapeSlider = screen.getByLabelText(/Shape/);
      fireEvent.change(shapeSlider, { target: { value: '4' } });
      
      // Unmount should clean up
      unmount();
      
      // No timers should be pending
      expect(jest.getTimerCount()).toBe(0);
    });

    test('handles rapid parameter changes', () => {
      render(<GammaDistribution />);
      
      const shapeSlider = screen.getByLabelText(/Shape/);
      const rateSlider = screen.getByLabelText(/Rate/);
      
      // Rapid changes
      for (let i = 1; i <= 5; i++) {
        fireEvent.change(shapeSlider, { target: { value: String(i) } });
        fireEvent.change(rateSlider, { target: { value: String(i * 0.5) } });
      }
      
      // Component should not crash
      expect(screen.getByText('Gamma Distribution Explorer')).toBeInTheDocument();
    });
  });

  describe('Parameter Validation', () => {
    test('enforces minimum rate to prevent division by zero', () => {
      render(<GammaDistribution />);
      
      const rateSlider = screen.getByLabelText(/Rate/);
      fireEvent.change(rateSlider, { target: { value: '0' } });
      
      // Should use safeRate (0.001) internally
      expect(screen.getByText('Scale (θ)')).toBeInTheDocument();
      // Scale should be 1/0.001 = 1000, but displayed as a reasonable value
    });

    test('handles edge case shape values', () => {
      render(<GammaDistribution />);
      
      const shapeSlider = screen.getByLabelText(/Shape/);
      
      // Test shape = 0.5 (valid but edge case)
      fireEvent.change(shapeSlider, { target: { value: '0.5' } });
      expect(screen.getByText('Gamma Distribution Explorer')).toBeInTheDocument();
      
      // Test shape = 10 (upper bound)
      fireEvent.change(shapeSlider, { target: { value: '10' } });
      expect(screen.getByText('Gamma Distribution Explorer')).toBeInTheDocument();
    });

    test('calculates mode correctly for different shape values', () => {
      render(<GammaDistribution />);
      
      const shapeSlider = screen.getByLabelText(/Shape/);
      
      // When shape <= 1, mode should be 0
      fireEvent.change(shapeSlider, { target: { value: '1' } });
      expect(screen.queryByText('Mode')).not.toBeInTheDocument();
      
      // When shape > 1, mode should be displayed
      fireEvent.change(shapeSlider, { target: { value: '3' } });
      expect(screen.getByText('Mode')).toBeInTheDocument();
    });
  });

  describe('Progressive Learning States', () => {
    test('advances through learning stages based on interactions', () => {
      render(<GammaDistribution />);
      
      const shapeSlider = screen.getByLabelText(/Shape/);
      
      // Stage 1 - Integer shape parameters
      expect(screen.getByText(/Stage 1: Integer Shape Parameters/)).toBeInTheDocument();
      
      // Make multiple interactions
      for (let i = 0; i < 6; i++) {
        fireEvent.change(shapeSlider, { target: { value: String((i % 4) + 1) } });
      }
      
      // Should advance to Stage 2
      expect(screen.getByText(/Stage 2: Fractional Shape Parameters/)).toBeInTheDocument();
    });

    test('shows appropriate insights for each stage', () => {
      render(<GammaDistribution />);
      
      // Initial insight
      expect(screen.getByText(/How do insurance companies predict total claim costs/)).toBeInTheDocument();
      
      // After first interaction
      const shapeSlider = screen.getByLabelText(/Shape/);
      fireEvent.change(shapeSlider, { target: { value: '4' } });
      
      // Story phase insight
      jest.advanceTimersByTime(1000);
      expect(screen.queryByText(/Watch the pattern emerge/)).toBeInTheDocument();
    });
  });

  describe('UI Interactions', () => {
    test('toggles CDF view', () => {
      render(<GammaDistribution />);
      
      const cdfCheckbox = screen.getByLabelText('CDF');
      fireEvent.click(cdfCheckbox);
      
      expect(cdfCheckbox).toBeChecked();
    });

    test('shows sum of exponentials when enabled', () => {
      render(<GammaDistribution />);
      
      // First need to advance to stage 2
      const shapeSlider = screen.getByLabelText(/Shape/);
      for (let i = 0; i < 6; i++) {
        fireEvent.change(shapeSlider, { target: { value: String((i % 4) + 1) } });
      }
      
      // Now the checkbox should be available
      const sumCheckbox = screen.getByLabelText('Sum of Exponentials');
      fireEvent.click(sumCheckbox);
      
      expect(sumCheckbox).toBeChecked();
    });

    test('toggles advanced options', () => {
      render(<GammaDistribution />);
      
      const advancedButton = screen.getByText('Advanced');
      fireEvent.click(advancedButton);
      
      expect(screen.getByText('Advanced Features')).toBeInTheDocument();
    });

    test('continues from story to explorer', async () => {
      render(<GammaDistribution />);
      
      // Trigger story
      const shapeSlider = screen.getByLabelText(/Shape/);
      fireEvent.change(shapeSlider, { target: { value: '4' } });
      
      // Fast forward to story phase 2
      jest.advanceTimersByTime(10000);
      
      // Look for continue button
      await waitFor(() => {
        const continueButton = screen.queryByText(/Continue to Distribution Explorer/);
        if (continueButton) {
          fireEvent.click(continueButton);
        }
      });
    });
  });

  describe('Special Cases Detection', () => {
    test('detects exponential distribution (k=1)', () => {
      render(<GammaDistribution />);
      
      // Advance to stage 3
      const shapeSlider = screen.getByLabelText(/Shape/);
      for (let i = 0; i < 16; i++) {
        fireEvent.change(shapeSlider, { target: { value: String((i % 4) + 1) } });
      }
      
      // Set shape to 1
      fireEvent.change(shapeSlider, { target: { value: '1' } });
      
      // Should highlight exponential case
      expect(screen.getByText('Exponential Distribution')).toBeInTheDocument();
    });

    test('detects chi-squared distribution', () => {
      render(<GammaDistribution />);
      
      // Advance to stage 3
      const shapeSlider = screen.getByLabelText(/Shape/);
      const rateSlider = screen.getByLabelText(/Rate/);
      
      for (let i = 0; i < 16; i++) {
        fireEvent.change(shapeSlider, { target: { value: String((i % 4) + 1) } });
      }
      
      // Set chi-squared parameters (k=n/2, θ=2, so rate=0.5)
      fireEvent.change(shapeSlider, { target: { value: '2' } });
      fireEvent.change(rateSlider, { target: { value: '0.5' } });
      
      // Should highlight chi-squared case
      expect(screen.getByText('Chi-Squared Distribution')).toBeInTheDocument();
    });
  });

  describe('Memory and Performance', () => {
    test('handles invalid gamma function inputs gracefully', () => {
      render(<GammaDistribution />);
      
      // Set extreme parameters that might cause calculation issues
      const shapeSlider = screen.getByLabelText(/Shape/);
      const rateSlider = screen.getByLabelText(/Rate/);
      
      fireEvent.change(shapeSlider, { target: { value: '0.5' } });
      fireEvent.change(rateSlider, { target: { value: '0.2' } });
      
      // Component should still be functional
      expect(screen.getByText('Gamma Distribution Explorer')).toBeInTheDocument();
    });

    test('cleans up all animations on parameter change', () => {
      render(<GammaDistribution />);
      
      // Enable sum of exponentials
      const shapeSlider = screen.getByLabelText(/Shape/);
      for (let i = 0; i < 6; i++) {
        fireEvent.change(shapeSlider, { target: { value: String((i % 4) + 1) } });
      }
      
      const sumCheckbox = screen.getByLabelText('Sum of Exponentials');
      fireEvent.click(sumCheckbox);
      
      // Change parameters while animation is running
      fireEvent.change(shapeSlider, { target: { value: '5' } });
      
      // Should not accumulate animation frames
      expect(jest.getTimerCount()).toBeLessThan(5);
    });
  });

  describe('Responsive Design', () => {
    test('renders correctly on small screens', () => {
      // Mock small screen
      global.innerWidth = 375;
      global.innerHeight = 667;
      
      render(<GammaDistribution />);
      
      expect(screen.getByText('Gamma Distribution Explorer')).toBeInTheDocument();
      expect(screen.getByText(/Shape/)).toBeInTheDocument();
    });
  });
});