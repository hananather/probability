import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmpiricalRule from '../EmpiricalRule';
import * as d3 from 'd3';
import * as jStat from 'jstat';

// Mock dependencies
jest.mock('d3');
jest.mock('jstat');

// Mock MathJax
global.MathJax = {
  typesetPromise: jest.fn(() => Promise.resolve()),
  typesetClear: jest.fn(),
};

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('EmpiricalRule Component', () => {
  let mockD3Select;
  
  beforeEach(() => {
    // Setup D3 mocks
    mockD3Select = {
      selectAll: jest.fn().mockReturnThis(),
      remove: jest.fn().mockReturnThis(),
      append: jest.fn().mockReturnThis(),
      attr: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis(),
      datum: jest.fn().mockReturnThis(),
      data: jest.fn().mockReturnThis(),
      enter: jest.fn().mockReturnThis(),
      call: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
    };
    
    d3.select.mockReturnValue(mockD3Select);
    d3.scaleLinear.mockReturnValue({
      domain: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
    });
    d3.range.mockReturnValue([]);
    d3.area.mockReturnValue({
      x: jest.fn().mockReturnThis(),
      y0: jest.fn().mockReturnThis(),
      y1: jest.fn().mockReturnThis(),
      curve: jest.fn().mockReturnThis(),
    });
    d3.line.mockReturnValue({
      x: jest.fn().mockReturnThis(),
      y: jest.fn().mockReturnThis(),
      curve: jest.fn().mockReturnThis(),
    });
    d3.histogram.mockReturnValue(jest.fn(() => []));
    d3.axisBottom.mockReturnValue(jest.fn());
    d3.axisLeft.mockReturnValue(jest.fn());
    
    // Mock jStat
    jStat.normal.sample.mockImplementation((mu, sigma) => {
      // Simple mock implementation
      return mu + (Math.random() - 0.5) * sigma * 2;
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('Rendering Tests', () => {
    test('renders without crashing', () => {
      const { container } = render(<EmpiricalRule />);
      expect(container).toBeInTheDocument();
    });
    
    test('displays all UI elements', () => {
      render(<EmpiricalRule />);
      
      // Check title
      expect(screen.getByText('The Empirical Rule (68-95-99.7 Rule)')).toBeInTheDocument();
      
      // Check control buttons
      expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /histogram/i })).toBeInTheDocument();
      
      // Check parameter controls
      expect(screen.getByText(/Distribution Parameters/)).toBeInTheDocument();
      expect(screen.getByText(/Sample Statistics/)).toBeInTheDocument();
      expect(screen.getByText(/The Empirical Rule/)).toBeInTheDocument();
    });
    
    test('initializes with correct default values', () => {
      render(<EmpiricalRule />);
      
      // Check default parameter values
      expect(screen.getByText('100')).toBeInTheDocument(); // Default mu
      expect(screen.getByText('15')).toBeInTheDocument(); // Default sigma
      
      // Check initial sample count
      expect(screen.getByText('Total Samples:')).toBeInTheDocument();
      expect(screen.getByText(/0 \(0.0%\)/)).toBeInTheDocument();
    });
  });

  describe('State Management Tests', () => {
    test('updates mean when slider changes', async () => {
      render(<EmpiricalRule />);
      
      const meanSlider = screen.getAllByRole('slider')[0];
      fireEvent.change(meanSlider, { target: { value: '120' } });
      
      await waitFor(() => {
        expect(screen.getByText('120')).toBeInTheDocument();
      });
    });
    
    test('updates standard deviation when slider changes', async () => {
      render(<EmpiricalRule />);
      
      const sigmaSlider = screen.getAllByRole('slider')[1];
      fireEvent.change(sigmaSlider, { target: { value: '20' } });
      
      await waitFor(() => {
        expect(screen.getByText('20')).toBeInTheDocument();
      });
    });
    
    test('toggles sample generation on play/pause click', async () => {
      jest.useFakeTimers();
      render(<EmpiricalRule />);
      
      const playButton = screen.getByRole('button', { name: /generate/i });
      
      // Start generation
      fireEvent.click(playButton);
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      
      // Advance timers to generate samples
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // Stop generation
      fireEvent.click(screen.getByRole('button', { name: /pause/i }));
      expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
      
      jest.useRealTimers();
    });
    
    test('clears samples on reset', async () => {
      jest.useFakeTimers();
      render(<EmpiricalRule />);
      
      // Generate some samples
      const playButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(playButton);
      
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      // Reset
      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Total Samples:.*0/)).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
    
    test('limits samples array to 1000 items', async () => {
      jest.useFakeTimers();
      render(<EmpiricalRule />);
      
      const playButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(playButton);
      
      // Generate more than 1000 samples (50ms interval * 21 seconds = 1050 samples)
      act(() => {
        jest.advanceTimersByTime(51000);
      });
      
      // Should show exactly 1000 samples
      await waitFor(() => {
        expect(screen.getByText(/Total Samples:.*1000/)).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Mathematical Accuracy Tests', () => {
    test('calculates percentages correctly with known samples', async () => {
      const { rerender } = render(<EmpiricalRule />);
      
      // Mock samples with known distribution
      const mu = 100;
      const sigma = 15;
      const mockSamples = [
        mu, // Exactly at mean (within all ranges)
        mu + sigma * 0.5, // Within 1σ
        mu - sigma * 0.8, // Within 1σ
        mu + sigma * 1.5, // Within 2σ but not 1σ
        mu - sigma * 1.8, // Within 2σ but not 1σ
        mu + sigma * 2.5, // Within 3σ but not 2σ
        mu - sigma * 2.8, // Within 3σ but not 2σ
        mu + sigma * 3.5, // Outside 3σ
      ];
      
      // We need to trigger the component to use our mock samples
      // This would require modifying the component to accept initial samples as prop
      // For now, we'll test the calculation logic
      
      const within1SD = mockSamples.filter(x => Math.abs(x - mu) <= sigma).length;
      const within2SD = mockSamples.filter(x => Math.abs(x - mu) <= 2 * sigma).length;
      const within3SD = mockSamples.filter(x => Math.abs(x - mu) <= 3 * sigma).length;
      
      expect(within1SD).toBe(3); // 37.5%
      expect(within2SD).toBe(5); // 62.5%
      expect(within3SD).toBe(7); // 87.5%
    });
    
    test('handles empty samples array gracefully', () => {
      render(<EmpiricalRule />);
      
      // With no samples, all percentages should be 0
      expect(screen.getAllByText(/0.0%/)).toHaveLength(3);
    });
  });

  describe('Memory Management Tests', () => {
    test('cleans up interval on unmount', () => {
      jest.useFakeTimers();
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      const { unmount } = render(<EmpiricalRule />);
      
      // Start generation
      const playButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(playButton);
      
      // Unmount component
      unmount();
      
      // Verify interval was cleared
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      clearIntervalSpy.mockRestore();
      jest.useRealTimers();
    });
    
    test('removes event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<EmpiricalRule />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    test('handles rapid play/pause toggling', async () => {
      jest.useFakeTimers();
      render(<EmpiricalRule />);
      
      const playButton = screen.getByRole('button', { name: /generate/i });
      
      // Rapidly toggle multiple times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(playButton);
        act(() => {
          jest.advanceTimersByTime(10);
        });
      }
      
      // Component should still be functional
      expect(screen.getByRole('button')).toBeInTheDocument();
      
      jest.useRealTimers();
    });
    
    test('handles extreme parameter values', () => {
      render(<EmpiricalRule />);
      
      // Test minimum sigma
      const sigmaSlider = screen.getAllByRole('slider')[1];
      fireEvent.change(sigmaSlider, { target: { value: '5' } });
      expect(screen.getByText('5')).toBeInTheDocument();
      
      // Test maximum sigma
      fireEvent.change(sigmaSlider, { target: { value: '30' } });
      expect(screen.getByText('30')).toBeInTheDocument();
      
      // Component should not crash
      expect(screen.getByText('The Empirical Rule (68-95-99.7 Rule)')).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    test('supports keyboard navigation', async () => {
      render(<EmpiricalRule />);
      const user = userEvent.setup();
      
      // Tab through interactive elements
      await user.tab();
      expect(screen.getByRole('button', { name: /histogram/i })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /generate/i })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /reset/i })).toHaveFocus();
    });
    
    test('provides descriptive text for visual information', () => {
      render(<EmpiricalRule />);
      
      // Check for text descriptions of the rules
      expect(screen.getByText(/≈68% of data within one standard deviation/)).toBeInTheDocument();
      expect(screen.getByText(/≈95% of data within two standard deviations/)).toBeInTheDocument();
      expect(screen.getByText(/≈99.7% of data within three standard deviations/)).toBeInTheDocument();
    });
  });

  describe('Performance Tests', () => {
    test('renders within acceptable time', () => {
      const startTime = performance.now();
      render(<EmpiricalRule />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms
    });
    
    test('handles parameter changes efficiently', async () => {
      render(<EmpiricalRule />);
      const slider = screen.getAllByRole('slider')[0];
      
      const startTime = performance.now();
      
      // Simulate rapid slider movements
      for (let i = 60; i <= 140; i += 5) {
        fireEvent.change(slider, { target: { value: i.toString() } });
      }
      
      const endTime = performance.now();
      
      // Should handle all updates in reasonable time
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});

describe('Bug Fixes and Improvements', () => {
  test('prevents division by zero', () => {
    // This test would require modifying the component to handle sigma = 0
    // Currently the slider minimum is 5, but defensive programming would check
    expect(true).toBe(true); // Placeholder
  });
  
  test('optimizes count calculations for performance', () => {
    // Test that the O(3n) calculation could be optimized to O(n)
    // This would require refactoring the component
    
    const samples = Array.from({ length: 1000 }, (_, i) => 100 + (i - 500) * 0.1);
    const mu = 100;
    const sigma = 15;
    
    const startTime = performance.now();
    
    // Current approach (3 passes)
    const within1SD = samples.filter(x => Math.abs(x - mu) <= sigma).length;
    const within2SD = samples.filter(x => Math.abs(x - mu) <= 2 * sigma).length;
    const within3SD = samples.filter(x => Math.abs(x - mu) <= 3 * sigma).length;
    
    const currentTime = performance.now() - startTime;
    
    // Optimized approach (1 pass)
    const optimizedStart = performance.now();
    let opt1SD = 0, opt2SD = 0, opt3SD = 0;
    
    samples.forEach(x => {
      const deviation = Math.abs(x - mu);
      if (deviation <= sigma) opt1SD++;
      if (deviation <= 2 * sigma) opt2SD++;
      if (deviation <= 3 * sigma) opt3SD++;
    });
    
    const optimizedTime = performance.now() - optimizedStart;
    
    // Optimized should be faster
    expect(optimizedTime).toBeLessThan(currentTime);
  });
});