"use client";

import React, { useState } from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import HistogramIntuitiveIntro from "./4-4-1-HistogramIntuitiveIntro";
import HistogramShapeExplorer from "./4-4-2-HistogramShapeExplorer";
import HistogramInteractiveJourney from "./4-4-3-HistogramInteractiveJourney";
import HistogramShapeAnalysis from "./4-4-4-HistogramShapeAnalysis";
import BoxplotQuartilesExplorer from "./4-4-5-BoxplotQuartilesExplorer";
import BoxplotQuartilesJourney from "./4-4-6-BoxplotQuartilesJourney";
import BoxplotRealWorldExplorer from "./4-4-7-BoxplotRealWorldExplorer";
import ScatterPlotAnimation from "./4-4-8-ScatterPlotAnimation";
import LineChartAnimation from "./4-4-9-LineChartAnimation";
import BoxPlotAnimation from "./4-4-10-BoxPlotAnimation";
import BarChartAnimation from "./4-4-11-BarChartAnimation";
import PieChartAnimation from "./4-4-12-PieChartAnimation";
import { Sparkles, Calculator, BarChart3, ChevronLeft, TrendingUp, LineChart, Box, BarChart2, PieChart } from "lucide-react";

// Learning paths configuration
const learningPaths = [
  {
    id: 'intro',
    title: '1. Histogram Introduction',
    description: 'Start here! See why we need histograms through animated examples.',
    icon: Sparkles,
    color: 'from-cyan-500 to-blue-500',
    component: HistogramIntuitiveIntro,
    difficulty: 'Beginner',
    duration: '5 min',
    concepts: ['What are bins?', 'Why group data?', 'Visual patterns']
  },
  {
    id: 'shape-explorer',
    title: '2. Histogram Shape Explorer',
    description: 'Explore how histogram shapes reveal data patterns.',
    icon: BarChart3,
    color: 'from-blue-500 to-indigo-500',
    component: HistogramShapeExplorer,
    difficulty: 'Beginner',
    duration: '8 min',
    concepts: ['Shape patterns', 'Data distributions', 'Visual analysis']
  },
  {
    id: 'journey',
    title: '3. Finding Optimal Bins',
    description: 'Learn the square root rule for choosing the perfect number of bins.',
    icon: Calculator,
    color: 'from-violet-500 to-purple-500', 
    component: HistogramInteractiveJourney,
    difficulty: 'Intermediate',
    duration: '10 min',
    concepts: ['Square root rule', 'k = √n formula', 'Bin optimization']
  },
  {
    id: 'shapes',
    title: '4. Shape Recognition',
    description: 'Learn different distribution shapes and their real-world meanings.',
    icon: BarChart3,
    color: 'from-emerald-500 to-teal-500',
    component: HistogramShapeAnalysis,
    difficulty: 'Advanced',
    duration: '15 min',
    concepts: ['Normal distribution', 'Skewness', 'Real-world patterns']
  },
  {
    id: 'boxplot-quartiles',
    title: '5. Boxplot Quartiles Explorer',
    description: 'Master quartiles and the five-number summary with interactive boxplots.',
    icon: Box,
    color: 'from-teal-500 to-cyan-500',
    component: BoxplotQuartilesExplorer,
    difficulty: 'Intermediate',
    duration: '10 min',
    concepts: ['Quartiles', 'Five-number summary', 'IQR', 'Data spread']
  },
  {
    id: 'boxplot-journey',
    title: '6. Boxplot Interactive Journey',
    description: 'Take an interactive journey through boxplot analysis.',
    icon: Box,
    color: 'from-cyan-500 to-blue-500',
    component: BoxplotQuartilesJourney,
    difficulty: 'Intermediate',
    duration: '12 min',
    concepts: ['Boxplot construction', 'Outlier detection', 'Distribution comparison']
  },
  {
    id: 'boxplot-realworld',
    title: '7. Boxplot Real-World Explorer',
    description: 'Apply boxplots to real-world datasets and scenarios.',
    icon: Box,
    color: 'from-blue-500 to-purple-500',
    component: BoxplotRealWorldExplorer,
    difficulty: 'Advanced',
    duration: '15 min',
    concepts: ['Real data analysis', 'Practical applications', 'Data insights']
  },
  {
    id: 'scatter',
    title: '8. Scatter Plots',
    description: 'Discover relationships between two variables with animated scatter plots.',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-500',
    component: ScatterPlotAnimation,
    difficulty: 'Beginner',
    duration: '5 min',
    concepts: ['Correlation', 'Trend lines', 'Variable relationships']
  },
  {
    id: 'line',
    title: '9. Line Charts',
    description: 'Learn how to visualize trends and changes over time.',
    icon: LineChart,
    color: 'from-pink-500 to-rose-500',
    component: LineChartAnimation,
    difficulty: 'Beginner',
    duration: '5 min',
    concepts: ['Time series', 'Trends', 'Seasonal patterns']
  },
  {
    id: 'box-animation',
    title: '10. Box Plot Animation',
    description: 'Understand data distributions with animated five-number summaries.',
    icon: Box,
    color: 'from-indigo-500 to-blue-600',
    component: BoxPlotAnimation,
    difficulty: 'Intermediate',
    duration: '7 min',
    concepts: ['Quartiles', 'IQR', 'Outliers', 'Distribution spread']
  },
  {
    id: 'bar',
    title: '11. Bar Charts',
    description: 'Compare categories visually with animated bar charts.',
    icon: BarChart2,
    color: 'from-green-500 to-emerald-500',
    component: BarChartAnimation,
    difficulty: 'Beginner',
    duration: '5 min',
    concepts: ['Categorical data', 'Comparisons', 'Rankings']
  },
  {
    id: 'pie',
    title: '12. Pie Charts',
    description: 'Visualize parts of a whole with engaging pie chart animations.',
    icon: PieChart,
    color: 'from-purple-500 to-pink-500',
    component: PieChartAnimation,
    difficulty: 'Beginner',
    duration: '5 min',
    concepts: ['Proportions', 'Percentages', 'Parts of whole']
  }
];

const ExploratoryDataAnalysisHub = () => {
  const [selectedPath, setSelectedPath] = useState(null);
  
  // If a path is selected, show that component
  if (selectedPath) {
    const SelectedComponent = selectedPath.component;
    return (
      <div>
        <div className="mb-4">
          <Button
            onClick={() => setSelectedPath(null)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Learning Paths
          </Button>
        </div>
        <SelectedComponent />
      </div>
    );
  }
  
  // Otherwise show the path selector
  return (
    <VisualizationContainer
      title="4.4 Exploratory Data Analysis"
      description="Master the essential visualization techniques for understanding data patterns"
    >
      {/* Introduction */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-600/30">
        <h2 className="text-xl font-semibold mb-3 text-blue-400">Welcome to Exploratory Data Analysis!</h2>
        <p className="text-gray-300 mb-4">
          Exploratory Data Analysis (EDA) is the detective work of statistics. Through interactive visualizations, 
          you'll learn how to uncover patterns, spot anomalies, test assumptions, and develop hypotheses about your data. 
          Master the essential tools - from histograms and box plots to scatter plots and beyond.
        </p>
        
        {/* Key concepts preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">📊</span>
            <div>
              <strong className="text-cyan-300">Distributions:</strong> Histograms & Box Plots
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-violet-400">📈</span>
            <div>
              <strong className="text-violet-300">Relationships:</strong> Scatter Plots & Line Charts
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">🥧</span>
            <div>
              <strong className="text-emerald-300">Comparisons:</strong> Bar Charts & Pie Charts
            </div>
          </div>
        </div>
      </div>
      
      {/* Learning path cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {learningPaths.map((path) => {
          const Icon = path.icon;
          return (
            <div
              key={path.id}
              className="group relative overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50 transition-all hover:border-gray-600 hover:bg-gray-800/70"
            >
              {/* Card gradient background */}
              <div className={cn(
                "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br",
                path.color
              )} />
              
              {/* Content */}
              <div className="relative p-6 space-y-4">
                {/* Icon and difficulty */}
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center",
                    path.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      path.difficulty === 'Beginner' && "bg-green-900/50 text-green-400",
                      path.difficulty === 'Intermediate' && "bg-blue-900/50 text-blue-400",
                      path.difficulty === 'Advanced' && "bg-purple-900/50 text-purple-400"
                    )}>
                      {path.difficulty}
                    </span>
                  </div>
                </div>
                
                {/* Title and description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{path.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{path.description}</p>
                </div>
                
                {/* Concepts covered */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">You'll Learn:</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {path.concepts.map((concept, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-500" />
                        {concept}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Duration and action */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500">⏱ {path.duration}</span>
                  <Button
                    onClick={() => setSelectedPath(path)}
                    size="sm"
                    className="px-4"
                  >
                    Begin
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Learning objectives summary */}
      <div className="mt-8 p-6 bg-gray-800/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Complete Learning Objectives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-cyan-400">Core Visualization Concepts</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>When to use each chart type for maximum insight</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>Understanding distributions with histograms and box plots</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>Revealing relationships with scatter plots</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>Tracking trends over time with line charts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>Comparing categories with bar and pie charts</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-violet-400">Practical Data Skills</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Choosing the right visualization for your data type</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Identifying correlations and outliers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Understanding quartiles and five-number summaries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Interpreting patterns and drawing conclusions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Avoiding common visualization mistakes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Quick tip */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong className="text-blue-400">Pro Tip:</strong> Each visualization type has its strengths. 
          Histograms show distributions, scatter plots reveal correlations, line charts track changes over time, 
          and bar charts compare categories. Choose the right tool for your data story!
        </p>
      </div>
    </VisualizationContainer>
  );
};

export default ExploratoryDataAnalysisHub;