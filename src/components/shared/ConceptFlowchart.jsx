"use client";
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card } from '../ui/card';
import { Info, BookOpen, Calculator, BarChart, Target, Brain, FlaskConical, TrendingUp, ArrowRight } from 'lucide-react';
import { useMathJax } from '../../hooks/useMathJax';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

/**
 * Interactive flowchart showing relationships between all course concepts
 * Responsive design with mobile-first approach
 */
function ConceptFlowchart() {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [focusedChapterIndex, setFocusedChapterIndex] = useState(0);
  const svgRef = useRef(null);
  const contentRef = useMathJax([hoveredNode]);
  const router = useRouter();
  
  // Function to navigate to a chapter
  const navigateToChapter = (chapterId) => {
    const chapterNum = chapterId.replace('ch', '');
    router.push(`/chapter${chapterNum}`);
  };

  // Define the complete concept hierarchy
  const conceptHierarchy = {
    id: 'root',
    name: 'Probability & Statistics',
    children: [
      {
        id: 'ch1',
        name: 'Chapter 1: Probability Foundations',
        shortName: 'Probability',
        icon: BookOpen,
        color: '#10b981',
        concepts: [
          { name: 'Sample Space', formula: '\\(S = \\{\\text{all outcomes}\\}\\)' },
          { name: 'Basic Probability', formula: '\\(P(A) = \\frac{n(A)}{n(S)}\\)' },
          { name: 'Conditional Probability', formula: '\\(P(A|B) = \\frac{P(A \\cap B)}{P(B)}\\)' },
          { name: 'Bayes Theorem', formula: '\\(P(A|B) = \\frac{P(B|A)P(A)}{P(B)}\\)' },
          { name: 'Combinatorics', formula: '\\(C(n,r) = \\frac{n!}{r!(n-r)!}\\)' }
        ],
        children: []
      },
      {
        id: 'ch2',
        name: 'Chapter 2: Discrete Random Variables',
        shortName: 'Discrete RV',
        icon: Calculator,
        color: '#3b82f6',
        concepts: [
          { name: 'PMF', formula: '\\(P(X = x)\\)' },
          { name: 'Expected Value', formula: '\\(E[X] = \\sum x \\cdot P(X=x)\\)' },
          { name: 'Variance', formula: '\\(Var(X) = E[X^2] - (E[X])^2\\)' },
          { name: 'Binomial', formula: '\\(P(X=k) = C(n,k)p^k(1-p)^{n-k}\\)' },
          { name: 'Poisson', formula: '\\(P(X=k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}\\)' }
        ],
        children: []
      },
      {
        id: 'ch3',
        name: 'Chapter 3: Continuous Random Variables',
        shortName: 'Continuous RV',
        icon: TrendingUp,
        color: '#8b5cf6',
        concepts: [
          { name: 'PDF', formula: '\\(f(x)\\)' },
          { name: 'Normal Distribution', formula: '\\(N(\\mu, \\sigma^2)\\)' },
          { name: 'Z-Score', formula: '\\(Z = \\frac{X - \\mu}{\\sigma}\\)' },
          { name: 'Exponential', formula: '\\(f(x) = \\lambda e^{-\\lambda x}\\)' },
          { name: 'Central Limit Theorem', formula: '\\(\\bar{X} \\sim N(\\mu, \\frac{\\sigma^2}{n})\\)' }
        ],
        children: []
      },
      {
        id: 'ch4',
        name: 'Chapter 4: Descriptive Statistics',
        shortName: 'Statistics',
        icon: BarChart,
        color: '#f59e0b',
        concepts: [
          { name: 'Mean', formula: '\\(\\bar{x} = \\frac{\\sum x_i}{n}\\)' },
          { name: 'Standard Deviation', formula: '\\(s = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n-1}}\\)' },
          { name: 'Sampling Distribution', formula: '\\(\\bar{X} \\sim N(\\mu, \\frac{\\sigma^2}{n})\\)' },
          { name: 'Standard Error', formula: '\\(SE = \\frac{\\sigma}{\\sqrt{n}}\\)' }
        ],
        children: []
      },
      {
        id: 'ch5',
        name: 'Chapter 5: Estimation',
        shortName: 'Estimation',
        icon: Target,
        color: '#ef4444',
        concepts: [
          { name: 'Point Estimate', formula: '\\(\\hat{\\theta}\\)' },
          { name: 'Confidence Interval', formula: '\\(\\bar{x} \\pm z_{\\alpha/2} \\cdot SE\\)' },
          { name: 'Margin of Error', formula: '\\(ME = z_{\\alpha/2} \\cdot SE\\)' },
          { name: 't-Distribution', formula: '\\(t_{n-1}\\)' },
          { name: 'Sample Size', formula: '\\(n = \\left(\\frac{z_{\\alpha/2} \\cdot \\sigma}{E}\\right)^2\\)' }
        ],
        children: []
      },
      {
        id: 'ch6',
        name: 'Chapter 6: Hypothesis Testing',
        shortName: 'Hypothesis',
        icon: FlaskConical,
        color: '#ec4899',
        concepts: [
          { name: 'Null Hypothesis', formula: '\\(H_0\\)' },
          { name: 'Test Statistic', formula: '\\(z = \\frac{\\bar{x} - \\mu_0}{SE}\\)' },
          { name: 'p-value', formula: '\\(P(|Z| > |z_{obs}|)\\)' },
          { name: 'Type I Error', formula: '\\(\\alpha\\)' },
          { name: 'Power', formula: '\\(1 - \\beta\\)' }
        ],
        children: []
      },
      {
        id: 'ch7',
        name: 'Chapter 7: Linear Regression',
        shortName: 'Regression',
        icon: Brain,
        color: '#06b6d4',
        concepts: [
          { name: 'Correlation', formula: '\\(r = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i - \\bar{x})^2\\sum(y_i - \\bar{y})^2}}\\)' },
          { name: 'Regression Line', formula: '\\(\\hat{y} = b_0 + b_1x\\)' },
          { name: 'R-squared', formula: '\\(R^2 = \\frac{SSR}{SST}\\)' },
          { name: 'Residuals', formula: '\\(e_i = y_i - \\hat{y}_i\\)' }
        ],
        children: []
      }
    ]
  };

  // Define connections between chapters
  const connections = [
    { source: 'ch1', target: 'ch2', label: 'Foundation' },
    { source: 'ch2', target: 'ch3', label: 'Extends' },
    { source: 'ch3', target: 'ch4', label: 'Leads to' },
    { source: 'ch4', target: 'ch5', label: 'Enables' },
    { source: 'ch5', target: 'ch6', label: 'Connects' },
    { source: 'ch4', target: 'ch7', label: 'Foundation' },
    { source: 'ch1', target: 'ch5', label: 'Inference' },
    { source: 'ch3', target: 'ch5', label: 'Normal CI' },
    { source: 'ch3', target: 'ch6', label: 'Tests' }
  ];

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isMobile) return;
      
      const chapters = conceptHierarchy.children;
      let newIndex = focusedChapterIndex;
      
      switch(e.key) {
        case 'ArrowRight':
          newIndex = (focusedChapterIndex + 1) % chapters.length;
          break;
        case 'ArrowLeft':
          newIndex = (focusedChapterIndex - 1 + chapters.length) % chapters.length;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          const chapter = chapters[focusedChapterIndex];
          setHoveredNode(chapter);
          setSelectedChapter(chapter.id);
          break;
        case 'Escape':
          setHoveredNode(null);
          setSelectedChapter(null);
          break;
        default:
          return;
      }
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        setFocusedChapterIndex(newIndex);
        const chapter = chapters[newIndex];
        setHoveredNode(chapter);
        setSelectedChapter(chapter.id);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedChapterIndex, isMobile]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Responsive dimensions
    const containerWidth = svgRef.current.parentElement?.offsetWidth || 700;
    const width = isMobile ? Math.min(containerWidth, 350) : 700;
    const height = isMobile ? 300 : 400;
    const nodeRadius = isMobile ? 30 : 45;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Create arrow markers for connections
    const defs = svg.append('defs');
    
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 10)
      .attr('refY', 5)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#6b7280');

    // Position chapters in a responsive layout
    const chapters = conceptHierarchy.children;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = isMobile ? Math.min(width, height) * 0.35 : 140;
    const angleStep = (2 * Math.PI) / chapters.length;

    chapters.forEach((chapter, i) => {
      const angle = i * angleStep - Math.PI / 2;
      chapter.x = centerX + radius * Math.cos(angle);
      chapter.y = centerY + radius * Math.sin(angle);
    });

    // Draw connections with reduced opacity
    const linkGroup = svg.append('g').attr('class', 'links');
    
    connections.forEach(conn => {
      const source = chapters.find(ch => ch.id === conn.source);
      const target = chapters.find(ch => ch.id === conn.target);
      
      if (source && target) {
        const link = linkGroup.append('g')
          .attr('class', 'link-group')
          .style('opacity', 0.2);

        link.append('path')
          .attr('d', `M ${source.x},${source.y} Q ${centerX},${centerY} ${target.x},${target.y}`)
          .attr('fill', 'none')
          .attr('stroke', '#4b5563')
          .attr('stroke-width', 1.5)
          .attr('marker-end', 'url(#arrowhead)')
          .style('stroke-dasharray', '3,3');
      }
    });

    // Draw chapter nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    
    const nodes = nodeGroup.selectAll('.node')
      .data(chapters)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer');
    
    nodes.each(function(chapter) {
      const node = d3.select(this);
      const chapterIndex = chapters.indexOf(chapter);

      // Outer glow effect
      node.append('circle')
        .attr('r', nodeRadius + 5)
        .attr('fill', chapter.color)
        .attr('opacity', 0.1);

      // Main circle
      const circle = node.append('circle')
        .attr('r', nodeRadius)
        .attr('fill', `${chapter.color}20`)
        .attr('stroke', chapter.color)
        .attr('stroke-width', focusedChapterIndex === chapterIndex ? 3 : 2)
        .attr('stroke-dasharray', focusedChapterIndex === chapterIndex && !isMobile ? '5,2' : 'none')
        .style('transition', 'all 0.3s ease');

      // Chapter number
      node.append('text')
        .attr('y', isMobile ? -5 : -10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f3f4f6')
        .attr('font-size', isMobile ? '16px' : '20px')
        .attr('font-weight', 'bold')
        .text(chapter.id.replace('ch', ''));

      // Chapter short name
      node.append('text')
        .attr('y', isMobile ? 6 : 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f3f4f6')
        .attr('font-size', isMobile ? '9px' : '11px')
        .attr('font-weight', '500')
        .text(chapter.shortName);

      // Interaction effects (hover for desktop, click/tap for mobile)
      if (isMobile) {
        // Mobile: Use click/tap events to navigate directly
        node.on('click', function() {
          // Navigate to chapter on click
          navigateToChapter(chapter.id);
        });
      } else {
        // Desktop: Use hover events
        node.on('mouseenter', function() {
          d3.select(this).select('circle:nth-child(2)')
            .attr('r', nodeRadius + 3)
            .attr('fill', `${chapter.color}40`);
          
          setHoveredNode(chapter);
          setSelectedChapter(chapter.id);

          // Highlight connected paths
          connections.forEach(conn => {
            if (conn.source === chapter.id || conn.target === chapter.id) {
              linkGroup.selectAll('.link-group')
                .style('opacity', d => {
                  const matchesConn = connections.find(c => 
                    (c.source === conn.source && c.target === conn.target) ||
                    (c.source === conn.target && c.target === conn.source)
                  );
                  return matchesConn ? 0.8 : 0.1;
                });
            }
          });
        });

        node.on('mouseleave', function() {
          d3.select(this).select('circle:nth-child(2)')
            .attr('r', nodeRadius)
            .attr('fill', `${chapter.color}20`);
          
          linkGroup.selectAll('.link-group').style('opacity', 0.2);
        });
        
        // Add click handler for navigation on desktop
        node.on('click', function() {
          navigateToChapter(chapter.id);
        });
      }
    });

    // Add center node
    const centerNode = nodeGroup.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    centerNode.append('circle')
      .attr('r', isMobile ? 20 : 30)
      .attr('fill', '#374151')
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 1.5);

    centerNode.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', isMobile ? 3 : 4)
      .attr('fill', '#f3f4f6')
      .attr('font-size', isMobile ? '10px' : '12px')
      .attr('font-weight', 'bold')
      .text('Statistics');

  }, [isMobile, focusedChapterIndex]);

  // Generate screen reader description
  const getScreenReaderDescription = () => {
    if (!hoveredNode) {
      return 'Interactive course map showing 7 chapters arranged in a circular pattern. Navigate to explore each chapter\'s key concepts.';
    }
    
    return `${hoveredNode.name} selected. Contains ${hoveredNode.concepts.length} key concepts: ${hoveredNode.concepts.map(c => c.name).join(', ')}.`;
  };

  return (
    <div className="w-full">
      {/* Main container with responsive layout */}
      <Card className="p-2 sm:p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-white">Interactive Course Map</h2>
          <div className="flex flex-col items-end">
            <p className="text-xs text-gray-400 mt-1 sm:mt-0">
              {isMobile ? 'Tap chapters to explore' : 'Hover over chapters to explore concepts'}
            </p>
            {!isMobile && (
              <p className="text-xs text-gray-500 mt-0.5">
                Use arrow keys to navigate • Enter to select • Escape to clear
              </p>
            )}
          </div>
        </div>
        
        <div className={`${isMobile ? 'flex flex-col gap-4' : 'flex gap-4'}`}>
          {/* Flowchart */}
          <div className={isMobile ? 'w-full' : 'flex-1 min-w-0'}>
            <svg 
              ref={svgRef}
              className="w-full h-auto"
              style={{ maxHeight: isMobile ? '300px' : '400px' }}
              role="img"
              aria-label="Course concept flowchart"
              aria-describedby="flowchart-description"
            />
            <span id="flowchart-description" className="sr-only">
              {getScreenReaderDescription()}
            </span>
          </div>

          {/* Concept Details */}
          <div className={isMobile ? 'w-full' : 'w-[380px] flex-shrink-0'}>
            {hoveredNode ? (
              <div 
                ref={contentRef}
                className={`${isMobile ? 'p-3' : 'h-full p-4'} rounded-lg bg-gray-800/50 border border-gray-700/50`}
                style={{ borderColor: hoveredNode.color }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${isMobile ? 'p-1.5' : 'p-2'} rounded`} style={{ backgroundColor: `${hoveredNode.color}20` }}>
                    {React.createElement(hoveredNode.icon, { 
                      size: isMobile ? 18 : 20, 
                      color: hoveredNode.color 
                    })}
                  </div>
                  <div>
                    <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-white`}>{hoveredNode.name}</h3>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Key Concepts:</p>
                  <div className={isMobile ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
                    {hoveredNode.concepts.map((concept, idx) => (
                      <div 
                        key={idx}
                        className="bg-gray-900/50 rounded p-2 border border-gray-700/50"
                      >
                        <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold text-white mb-1`}>{concept.name}</p>
                        <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-300`}>
                          <span dangerouslySetInnerHTML={{ __html: concept.formula }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Add Start Chapter button */}
                <div className="mt-4">
                  <Link href={`/chapter${hoveredNode.id.replace('ch', '')}`}>
                    <Button 
                      size="sm" 
                      className="w-full group"
                      style={{ backgroundColor: hoveredNode.color }}
                    >
                      Start {hoveredNode.shortName}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className={`${isMobile ? 'p-6' : 'h-full p-8'} flex items-center justify-center rounded-lg bg-gray-800/30 border border-gray-700/30`}>
                <div className="text-center">
                  <Info size={isMobile ? 24 : 32} className="text-gray-600 mx-auto mb-3" />
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                    {isMobile ? 'Tap a chapter to see its key concepts' : 'Hover over a chapter to see its key concepts and formulas'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Screen reader accessible alternative */}
        <div className="sr-only" role="navigation" aria-label="Course chapters navigation">
          <h3>Course Chapters (Accessible Navigation)</h3>
          <ul>
            {conceptHierarchy.children.map((chapter) => (
              <li key={chapter.id}>
                <button
                  onClick={() => {
                    setHoveredNode(chapter);
                    setSelectedChapter(chapter.id);
                  }}
                  aria-label={`${chapter.name}. Contains ${chapter.concepts.length} concepts`}
                  aria-pressed={selectedChapter === chapter.id}
                >
                  {chapter.name}
                </button>
                {selectedChapter === chapter.id && (
                  <ul aria-label={`Concepts in ${chapter.name}`}>
                    {chapter.concepts.map((concept, idx) => (
                      <li key={idx}>
                        {concept.name} - Formula: {concept.formula.replace(/\\\\/g, '').replace(/[{}]/g, '')}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}

// Wrap with React.memo to prevent unnecessary re-renders from parent scroll updates
const MemoizedConceptFlowchart = React.memo(ConceptFlowchart);
MemoizedConceptFlowchart.displayName = 'ConceptFlowchart';

export default MemoizedConceptFlowchart;