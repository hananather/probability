"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from "@/utils/d3-utils";
import { Button } from '../ui/button';
import { ProgressBar } from '../ui/ProgressBar';
import { cn } from '../../lib/utils';

const STAGES = [
  {
    id: 'binomial',
    title: 'Counting Successes',
    subtitle: 'The Binomial Distribution',
    icon: '🎯',
    description: 'How many defective items in a batch of 20?',
    story: 'A factory produces items with a 10% defect rate. Quality control checks batches of 20 items.'
  },
  {
    id: 'geometric',
    title: 'Waiting for Success',
    subtitle: 'The Geometric Distribution',
    icon: '⏱️',
    description: 'How many calls until the first sale?',
    story: 'A call center has a 30% success rate per call. How long until the first sale?'
  },
  {
    id: 'poisson',
    title: 'Random Events in Time',
    subtitle: 'The Poisson Distribution',
    icon: '🌟',
    description: 'How many visitors per hour?',
    story: 'A website receives an average of 3 visitors per minute. How many in the next minute?'
  },
  {
    id: 'binomial-poisson',
    title: 'The Great Convergence',
    subtitle: 'Binomial → Poisson',
    icon: '🔄',
    description: 'When many rare events approximate Poisson',
    story: 'As trials increase and probability decreases, Binomial morphs into Poisson.'
  },
  {
    id: 'negative-binomial',
    title: 'Multiple Successes',
    subtitle: 'The Negative Binomial',
    icon: '🎰',
    description: 'How many trials for r successes?',
    story: 'A clinical trial needs 3 positive outcomes. How many patients must we test?'
  },
  {
    id: 'relationships',
    title: 'Everything Connects',
    subtitle: 'Distribution Relationships',
    icon: '🕸️',
    description: 'The beautiful web of probability',
    story: 'All distributions are connected through limits, special cases, and transformations.'
  }
];

// Binomial story animation
const BinomialStory = ({ isActive }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 350;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Parameters
    const n = 20;
    const p = 0.1;
    
    // Calculate binomial probabilities
    const factorial = (n) => {
      if (n <= 1) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) result *= i;
      return result;
    };
    
    const binomialPMF = (k, n, p) => {
      return (factorial(n) / (factorial(k) * factorial(n - k))) * 
             Math.pow(p, k) * Math.pow(1 - p, n - k);
    };
    
    const data = d3.range(0, n + 1).map(k => ({
      k: k,
      probability: binomialPMF(k, n, p)
    }));
    
    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.k))
      .range([0, innerWidth])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.probability) * 1.1])
      .range([innerHeight, 0]);
    
    // Draw axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Number of Defective Items");
    
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".2f")))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Probability");
    
    // Story text
    const storyText = g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#06b6d4")
      .style("font-size", "12px")
      .style("font-weight", "500");
    
    if (isActive) {
      
      // Animate bars growing
      const bars = g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.k))
        .attr("width", x.bandwidth())
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("fill", "#06b6d4")
        .attr("opacity", 0.8);
      
      // Staggered animation
      bars.transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr("y", d => y(d.probability))
        .attr("height", d => innerHeight - y(d.probability));
      
      // Update story text
      storyText.text("Each item has 10% chance of being defective")
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 1);
      
      // Highlight expected value
      setTimeout(() => {
        const expectedValue = n * p;
        g.append("line")
          .attr("x1", x(Math.floor(expectedValue)) + x.bandwidth() / 2)
          .attr("x2", x(Math.floor(expectedValue)) + x.bandwidth() / 2)
          .attr("y1", innerHeight)
          .attr("y2", 0)
          .attr("stroke", "#f97316")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5")
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .attr("opacity", 0.7);
        
        g.append("text")
          .attr("x", x(Math.floor(expectedValue)) + x.bandwidth() / 2)
          .attr("y", -20)
          .attr("text-anchor", "middle")
          .attr("fill", "#f97316")
          .style("font-size", "12px")
          .text(`Expected: ${expectedValue}`)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .attr("opacity", 1);
      }, 2500);
      
    } else {
      // Static view
      g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("x", d => x(d.k))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.probability))
        .attr("height", d => innerHeight - y(d.probability))
        .attr("fill", "#06b6d4")
        .attr("opacity", 0.6);
      
      storyText.text("Binomial(n=20, p=0.1)")
        .attr("opacity", 0.7);
    }
    
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full" />;
};

// Geometric story animation
const GeometricStory = ({ isActive }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 350;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Parameters
    const p = 0.3;
    const maxTrials = 15;
    
    // Calculate geometric probabilities
    const geometricPMF = (k, p) => Math.pow(1 - p, k - 1) * p;
    
    const data = d3.range(1, maxTrials + 1).map(k => ({
      k: k,
      probability: geometricPMF(k, p)
    }));
    
    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.k))
      .range([0, innerWidth])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.probability) * 1.1])
      .range([innerHeight, 0]);
    
    // Draw axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Number of Calls Until First Sale");
    
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".2f")))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Probability");
    
    if (isActive) {
      // Small timeline at top showing the concept
      const timeline = g.append("g")
        .attr("transform", `translate(${innerWidth/2}, 30)`);
      
      timeline.append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "#f97316")
        .style("font-size", "14px")
        .style("font-weight", "500")
        .text("Calls: ✗ ✗ ✗ ✓")
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .attr("opacity", 0.8);
      
      // Draw bars with decay pattern
      const bars = g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.k))
        .attr("width", x.bandwidth())
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("fill", "#f97316")
        .attr("opacity", 0.8);
      
      bars.transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .attr("y", d => y(d.probability))
        .attr("height", d => innerHeight - y(d.probability));
      
      // Add decay curve
      setTimeout(() => {
        const line = d3.line()
          .x(d => x(d.k) + x.bandwidth() / 2)
          .y(d => y(d.probability))
          .curve(d3.curveMonotoneX);
        
        g.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "#f97316")
          .attr("stroke-width", 2)
          .attr("opacity", 0)
          .attr("d", line)
          .transition()
          .duration(1000)
          .attr("opacity", 0.7);
      }, 1500);
      
    } else {
      // Static view
      g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("x", d => x(d.k))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.probability))
        .attr("height", d => innerHeight - y(d.probability))
        .attr("fill", "#f97316")
        .attr("opacity", 0.6);
    }
    
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full" />;
};

// Poisson story animation
const PoissonStory = ({ isActive }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 350;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Parameters
    const lambda = 3;
    const maxK = 10;
    
    // Calculate Poisson probabilities
    const factorial = (n) => {
      if (n <= 1) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) result *= i;
      return result;
    };
    
    const poissonPMF = (k, lambda) => {
      return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
    };
    
    const data = d3.range(0, maxK + 1).map(k => ({
      k: k,
      probability: poissonPMF(k, lambda)
    }));
    
    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.k))
      .range([0, innerWidth])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.probability) * 1.1])
      .range([innerHeight, 0]);
    
    // Draw axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Number of Website Visitors");
    
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".2f")))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Probability");
    
    if (isActive) {
      // Draw bars
      const bars = g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.k))
        .attr("width", x.bandwidth())
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("fill", "#10b981")
        .attr("opacity", 0.8);
      
      // Bars rise immediately
      bars.transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .attr("y", d => y(d.probability))
        .attr("height", d => innerHeight - y(d.probability));
      
      // Add lambda annotation
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("fill", "#10b981")
        .style("font-size", "14px")
        .text(`Average rate λ = ${lambda} visitors/minute`)
        .attr("opacity", 0)
        .transition()
        .delay(2000)
        .duration(500)
        .attr("opacity", 1);
      
    } else {
      // Static view
      g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("x", d => x(d.k))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.probability))
        .attr("height", d => innerHeight - y(d.probability))
        .attr("fill", "#10b981")
        .attr("opacity", 0.6);
    }
    
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full" />;
};

// Binomial to Poisson morphing animation
const BinomialPoissonMorph = ({ isActive }) => {
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 350;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Fixed np = 3
    const np = 3;
    const maxK = 10;
    
    // Helper functions
    const factorial = (n) => {
      if (n <= 1) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) result *= i;
      return result;
    };
    
    const binomialPMF = (k, n, p) => {
      return (factorial(n) / (factorial(k) * factorial(n - k))) * 
             Math.pow(p, k) * Math.pow(1 - p, n - k);
    };
    
    const poissonPMF = (k, lambda) => {
      return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
    };
    
    // Scales
    const x = d3.scaleBand()
      .domain(d3.range(0, maxK + 1))
      .range([0, innerWidth])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, 0.3])
      .range([innerHeight, 0]);
    
    // Draw axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("k");
    
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".2f")))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Probability");
    
    // Parameter display
    const paramText = g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .style("font-size", "12px");
    
    if (isActive) {
      let t = 0;
      
      const animate = () => {
        t += 0.02;
        const progress = (Math.sin(t) + 1) / 2; // Oscillate between 0 and 1
        
        // Interpolate n from 10 to 100
        const n = Math.round(10 + progress * 90);
        const p = np / n;
        
        // Calculate both distributions
        const binomialData = d3.range(0, maxK + 1).map(k => ({
          k: k,
          probability: binomialPMF(k, n, p)
        }));
        
        const poissonData = d3.range(0, maxK + 1).map(k => ({
          k: k,
          probability: poissonPMF(k, np)
        }));
        
        // Update parameter text
        paramText.text(`n = ${n}, p = ${p.toFixed(3)}, np = ${np}`);
        
        // Draw/update bars
        const bars = g.selectAll(".binomial-bar")
          .data(binomialData);
        
        bars.enter().append("rect")
          .attr("class", "binomial-bar")
          .attr("x", d => x(d.k))
          .attr("width", x.bandwidth())
          .attr("fill", "#06b6d4")
          .attr("opacity", 0.8)
          .merge(bars)
          .attr("y", d => y(d.probability))
          .attr("height", d => innerHeight - y(d.probability));
        
        // Draw Poisson overlay
        const poissonBars = g.selectAll(".poisson-bar")
          .data(poissonData);
        
        poissonBars.enter().append("rect")
          .attr("class", "poisson-bar")
          .attr("x", d => x(d.k) + x.bandwidth() * 0.25)
          .attr("width", x.bandwidth() * 0.5)
          .attr("fill", "#10b981")
          .attr("opacity", 0.5)
          .merge(poissonBars)
          .attr("y", d => y(d.probability))
          .attr("height", d => innerHeight - y(d.probability));
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      // Legend
      const legend = g.append("g")
        .attr("transform", `translate(${innerWidth - 150}, 10)`);
      
      legend.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#06b6d4")
        .attr("opacity", 0.8);
      
      legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .attr("fill", "#ffffff")
        .style("font-size", "12px")
        .text("Binomial");
      
      legend.append("rect")
        .attr("y", 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#10b981")
        .attr("opacity", 0.8);
      
      legend.append("text")
        .attr("x", 20)
        .attr("y", 32)
        .attr("fill", "#ffffff")
        .style("font-size", "12px")
        .text("Poisson(λ=3)");
      
      animate();
      
    } else {
      // Static view showing convergence
      const n = 50;
      const p = np / n;
      
      const binomialData = d3.range(0, maxK + 1).map(k => ({
        k: k,
        probability: binomialPMF(k, n, p)
      }));
      
      const poissonData = d3.range(0, maxK + 1).map(k => ({
        k: k,
        probability: poissonPMF(k, np)
      }));
      
      // Draw both distributions
      g.selectAll(".binomial-bar")
        .data(binomialData)
        .enter().append("rect")
        .attr("x", d => x(d.k))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.probability))
        .attr("height", d => innerHeight - y(d.probability))
        .attr("fill", "#06b6d4")
        .attr("opacity", 0.6);
      
      g.selectAll(".poisson-bar")
        .data(poissonData)
        .enter().append("rect")
        .attr("x", d => x(d.k) + x.bandwidth() * 0.25)
        .attr("width", x.bandwidth() * 0.5)
        .attr("y", d => y(d.probability))
        .attr("height", d => innerHeight - y(d.probability))
        .attr("fill", "#10b981")
        .attr("opacity", 0.4);
      
      paramText.text(`n = ${n}, p = ${p.toFixed(3)}, np = ${np}`)
        .attr("opacity", 0.7);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full" />;
};

// Negative Binomial story animation
const NegativeBinomialStory = ({ isActive }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 350;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Parameters
    const r = 3; // Need 3 positive outcomes
    const p = 0.4; // Success probability
    const maxTrials = 15;
    
    // Calculate negative binomial probabilities
    const factorial = (n) => {
      if (n <= 1) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) result *= i;
      return result;
    };
    
    const binomialCoeff = (n, k) => {
      return factorial(n) / (factorial(k) * factorial(n - k));
    };
    
    const negativeBinomialPMF = (k, r, p) => {
      return binomialCoeff(k - 1, r - 1) * Math.pow(p, r) * Math.pow(1 - p, k - r);
    };
    
    const data = d3.range(r, maxTrials + 1).map(k => ({
      k: k,
      probability: negativeBinomialPMF(k, r, p)
    }));
    
    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.k))
      .range([0, innerWidth])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.probability) * 1.1])
      .range([innerHeight, 0]);
    
    // Draw axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Number of Patients Tested");
    
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".2f")))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#ffffff")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Probability");
    
    if (isActive) {
      // Show target at top
      const targetText = g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("fill", "#8b5cf6")
        .style("font-size", "14px")
        .style("font-weight", "500")
        .text("Target: 3 positive outcomes (40% success rate)")
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .attr("opacity", 0.8);
      
      // Draw bars immediately
      const bars = g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.k))
        .attr("width", x.bandwidth())
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("fill", "#8b5cf6")
        .attr("opacity", 0.8);
      
      bars.transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .attr("y", d => y(d.probability))
        .attr("height", d => innerHeight - y(d.probability));
      
      // Highlight the actual outcome
      setTimeout(() => {
          g.append("line")
            .attr("x1", x(8) + x.bandwidth() / 2)
            .attr("x2", x(8) + x.bandwidth() / 2)
            .attr("y1", innerHeight)
            .attr("y2", y(data.find(d => d.k === 8).probability))
            .attr("stroke", "#10b981")
            .attr("stroke-width", 3)
            .attr("opacity", 0)
            .transition()
            .duration(500)
            .attr("opacity", 1);
          
          g.append("text")
            .attr("x", x(8) + x.bandwidth() / 2)
            .attr("y", y(data.find(d => d.k === 8).probability) - 10)
            .attr("text-anchor", "middle")
            .attr("fill", "#10b981")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("3rd success!")
            .attr("opacity", 0)
            .transition()
            .duration(500)
            .attr("opacity", 1);
        }, 1000);
      
    } else {
      // Static view
      g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("x", d => x(d.k))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.probability))
        .attr("height", d => innerHeight - y(d.probability))
        .attr("fill", "#8b5cf6")
        .attr("opacity", 0.6);
    }
    
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full" />;
};

// Distribution relationships diagram
const RelationshipsDiagram = ({ isActive }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 400;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Distribution nodes - with more space
    const nodes = [
      { id: 'binomial', name: 'Binomial', x: 150, y: 100, color: '#06b6d4' },
      { id: 'geometric', name: 'Geometric', x: 80, y: 250, color: '#f97316' },
      { id: 'negative-binomial', name: 'Negative\nBinomial', x: 220, y: 250, color: '#8b5cf6' },
      { id: 'poisson', name: 'Poisson', x: 350, y: 100, color: '#10b981' },
      { id: 'normal', name: 'Normal', x: 450, y: 350, color: '#3b82f6' }
    ];
    
    // Relationships
    const links = [
      { source: 'negative-binomial', target: 'geometric', label: 'r = 1', type: 'special' },
      { source: 'binomial', target: 'poisson', label: 'n→∞, p→0\nnp=λ', type: 'limit' },
      { source: 'binomial', target: 'normal', label: 'n→∞', type: 'limit' },
      { source: 'poisson', target: 'normal', label: 'λ→∞', type: 'limit' },
      { source: 'geometric', target: 'negative-binomial', label: 'generalization', type: 'extends' }
    ];
    
    // Create gradient definitions
    const defs = svg.append("defs");
    
    nodes.forEach(node => {
      const gradient = defs.append("radialGradient")
        .attr("id", `gradient-${node.id}`);
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", node.color)
        .attr("stop-opacity", 0.8);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", node.color)
        .attr("stop-opacity", 0.2);
    });
    
    // Draw links
    const linkGroup = svg.append("g").attr("class", "links");
    
    links.forEach((link, i) => {
      const source = nodes.find(n => n.id === link.source);
      const target = nodes.find(n => n.id === link.target);
      
      const linkPath = linkGroup.append("g")
        .attr("class", "link-group")
        .attr("opacity", isActive ? 0 : 0.5);
      
      // Calculate control points for curved paths
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dr = Math.sqrt(dx * dx + dy * dy);
      
      // Draw arrow path
      const path = linkPath.append("path")
        .attr("d", `M${source.x},${source.y} Q${(source.x + target.x) / 2},${(source.y + target.y) / 2 - 30} ${target.x},${target.y}`)
        .attr("fill", "none")
        .attr("stroke", "#4b5563")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)")
        .attr("stroke-dasharray", link.type === 'limit' ? "5,5" : "none");
      
      // Add label
      linkPath.append("text")
        .attr("x", (source.x + target.x) / 2)
        .attr("y", (source.y + target.y) / 2 - 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#9ca3af")
        .style("font-size", "11px")
        .selectAll("tspan")
        .data(link.label.split('\n'))
        .enter().append("tspan")
        .attr("x", (source.x + target.x) / 2)
        .attr("dy", (d, i) => i * 12)
        .text(d => d);
      
      if (isActive) {
        linkPath.transition()
          .duration(500)
          .delay(i * 300)
          .attr("opacity", 1);
      }
    });
    
    // Define arrowhead marker
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 5)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "#4b5563");
    
    // Draw nodes
    const nodeGroup = svg.append("g").attr("class", "nodes");
    
    nodes.forEach((node, i) => {
      const g = nodeGroup.append("g")
        .attr("transform", `translate(${node.x}, ${node.y})`)
        .attr("opacity", isActive ? 0 : 1);
      
      // Animated circle with gradient
      const circle = g.append("circle")
        .attr("r", isActive ? 0 : 55)
        .attr("fill", `url(#gradient-${node.id})`)
        .attr("stroke", node.color)
        .attr("stroke-width", 2);
      
      // Node label
      const text = g.append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .style("font-size", "13px")
        .style("font-weight", "bold");
      
      // Handle multi-line text
      const lines = node.name.split('\n');
      lines.forEach((line, lineIndex) => {
        text.append("tspan")
          .attr("x", 0)
          .attr("dy", lineIndex === 0 ? -5 * (lines.length - 1) : 14)
          .text(line);
      });
      
      if (isActive) {
        // Staggered appearance
        g.transition()
          .duration(300)
          .delay(i * 200)
          .attr("opacity", 1);
        
        circle.transition()
          .duration(500)
          .delay(i * 200)
          .attr("r", 55)
          .ease(d3.easeCubicOut);
      }
      
      // Hover effect
      g.style("cursor", "pointer")
        .on("mouseover", function() {
          d3.select(this).select("circle")
            .transition()
            .duration(200)
            .attr("r", 65)
            .attr("stroke-width", 3);
        })
        .on("mouseout", function() {
          d3.select(this).select("circle")
            .transition()
            .duration(200)
            .attr("r", 55)
            .attr("stroke-width", 2);
        });
    });
    
    // Add floating math symbols for ambiance
    if (isActive) {
      const symbols = ['∑', '∫', 'λ', 'μ', 'σ', 'π', '∞'];
      const symbolGroup = svg.append("g").attr("class", "symbols");
      
      const animateSymbol = (symbol, startX, startY) => {
        const text = symbolGroup.append("text")
          .attr("x", startX)
          .attr("y", startY)
          .attr("fill", "#374151")
          .style("font-size", "20px")
          .style("opacity", 0.3)
          .text(symbol);
        
        const animate = () => {
          text.transition()
            .duration(10000 + Math.random() * 5000)
            .ease(d3.easeLinear)
            .attr("y", -30)
            .style("opacity", 0)
            .on("end", () => {
              text.attr("y", height + 30)
                .attr("x", Math.random() * width)
                .style("opacity", 0.3);
              animate();
            });
        };
        
        animate();
      };
      
      // Start floating symbols
      symbols.forEach((symbol, i) => {
        setTimeout(() => {
          animateSymbol(symbol, Math.random() * width, height + 30);
        }, i * 500);
      });
    }
    
    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("The Web of Probability Distributions")
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .delay(nodes.length * 200)
      .attr("opacity", 1);
    
  }, [isActive]);
  
  return <svg ref={svgRef} className="w-full" />;
};

// Main component
export default function DistributionStories() {
  const [currentStage, setCurrentStage] = useState(0);
  const [visitedStages, setVisitedStages] = useState([0]);
  
  useEffect(() => {
    if (!visitedStages.includes(currentStage)) {
      setVisitedStages([...visitedStages, currentStage]);
    }
  }, [currentStage, visitedStages]);
  
  const handlePrevious = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentStage < STAGES.length - 1) {
      setCurrentStage(currentStage + 1);
    }
  };
  
  const renderStageContent = () => {
    switch (STAGES[currentStage].id) {
      case 'binomial':
        return <BinomialStory isActive={true} />;
      case 'geometric':
        return <GeometricStory isActive={true} />;
      case 'poisson':
        return <PoissonStory isActive={true} />;
      case 'binomial-poisson':
        return <BinomialPoissonMorph isActive={true} />;
      case 'negative-binomial':
        return <NegativeBinomialStory isActive={true} />;
      case 'relationships':
        return <RelationshipsDiagram isActive={true} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-600/30 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Distribution Stories
        </h1>
        <p className="text-neutral-300">
          Discover how probability distributions emerge from real-world scenarios
        </p>
        <div className="mt-4">
          <ProgressBar
            current={visitedStages.length}
            total={STAGES.length}
            label="Journey Progress"
            variant="purple"
          />
        </div>
      </div>
      
      {/* Stage Header */}
      <div className="bg-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{STAGES[currentStage].icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {STAGES[currentStage].title}
              </h2>
              <p className="text-lg text-blue-400 font-medium">
                {STAGES[currentStage].subtitle}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStage === 0}
            >
              ← Previous
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              disabled={currentStage === STAGES.length - 1}
            >
              Next →
            </Button>
          </div>
        </div>
        <p className="text-neutral-300">
          <span className="font-semibold">Scenario:</span> {STAGES[currentStage].story}
        </p>
      </div>
      
      {/* Stage Content */}
      <div className="bg-neutral-900/30 rounded-lg p-6 border border-neutral-800/50" style={{ minHeight: '500px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center"
          >
            {renderStageContent()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Stage Navigation Dots */}
      <div className="flex justify-center gap-2 pb-4">
        {STAGES.map((stage, index) => (
          <button
            key={stage.id}
            onClick={() => setCurrentStage(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              currentStage === index
                ? "bg-blue-500 w-8"
                : visitedStages.includes(index)
                ? "bg-blue-400/50"
                : "bg-gray-600"
            )}
            aria-label={`Go to ${stage.title}`}
          />
        ))}
      </div>
    </div>
  );
}