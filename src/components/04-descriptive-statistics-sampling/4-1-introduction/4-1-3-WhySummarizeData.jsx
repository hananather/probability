"use client";

import React, { useState, useEffect } from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Users, FileText, Eye, EyeOff, BarChart3, Zap, Clock, Brain } from "lucide-react";

const WhySummarizeData = () => {
  const [showRawData, setShowRawData] = useState(true);
  const [selectedExample, setSelectedExample] = useState(0);
  const [animateNumbers, setAnimateNumbers] = useState(false);
  const [userFoundPattern, setUserFoundPattern] = useState(false);
  const [expandedConcept, setExpandedConcept] = useState(null);
  const [showAnalogy, setShowAnalogy] = useState(false);

  // Generate realistic exam scores
  const generateExamScores = () => {
    const scores = [];
    // Create a somewhat normal distribution around 75
    for (let i = 0; i < 150; i++) {
      const base = 75;
      const variance = (Math.random() - 0.5) * 40;
      const score = Math.max(0, Math.min(100, Math.round(base + variance)));
      scores.push(score);
    }
    return scores;
  };

  const examScores = generateExamScores();
  
  // Calculate summary statistics
  const summaryStats = {
    mean: Math.round(examScores.reduce((a, b) => a + b, 0) / examScores.length * 10) / 10,
    median: (() => {
      const sorted = [...examScores].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    })(),
    min: Math.min(...examScores),
    max: Math.max(...examScores),
    passing: examScores.filter(s => s >= 60).length,
    failing: examScores.filter(s => s < 60).length
  };

  // Real-world examples
  const realWorldExamples = [
    {
      title: "Stock Market Indices",
      icon: TrendingUp,
      raw: "Thousands of individual stock prices changing every second",
      summarized: "S&P 500 Index: 4,783.45 (+1.2%)",
      benefit: "One number represents the entire market's performance",
      color: "text-green-400"
    },
    {
      title: "University Applications",
      icon: Users,
      raw: "50,000 applications with essays, test scores, activities, recommendations",
      summarized: "Average GPA: 3.8, Average SAT: 1450, Acceptance rate: 12%",
      benefit: "Quick understanding of admission competitiveness",
      color: "text-blue-400"
    },
    {
      title: "Weather Data",
      icon: Zap,
      raw: "Temperature readings every minute for 30 days (43,200 data points)",
      summarized: "Average: 72°F, Range: 58-89°F, Most common: 70-75°F",
      benefit: "Instant understanding of monthly weather patterns",
      color: "text-yellow-400"
    },
    {
      title: "Customer Reviews",
      icon: FileText,
      raw: "10,000 individual reviews with detailed comments",
      summarized: "4.2★ average, 78% positive, Main complaint: shipping speed",
      benefit: "Quick decision-making for both customers and business",
      color: "text-violet-400"
    }
  ];

  // The four main reasons to summarize
  const reasonsToSummarize = [
    {
      title: "Information Overload",
      icon: Brain,
      description: "Human brains can only process 7±2 pieces of information at once",
      example: "Looking at 1000 numbers vs. seeing mean=75, std=12",
      color: "from-red-500 to-orange-500"
    },
    {
      title: "Pattern Recognition",
      icon: Eye,
      description: "Summary statistics reveal patterns invisible in raw data",
      example: "Discovering that sales peak every Friday from thousands of transactions",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Decision Making",
      icon: Target,
      description: "Summaries enable quick, informed decisions",
      example: "A hiring manager comparing average performance scores across departments",
      color: "from-violet-500 to-purple-500"
    },
    {
      title: "Communication",
      icon: Users,
      description: "Summaries make data accessible to non-technical audiences",
      example: "Telling stakeholders 'revenue increased 15%' instead of showing spreadsheets",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  useEffect(() => {
    if (!showRawData) {
      setTimeout(() => setAnimateNumbers(true), 100);
    } else {
      setAnimateNumbers(false);
    }
  }, [showRawData]);

  const handlePatternSearch = () => {
    setUserFoundPattern(true);
    setTimeout(() => setUserFoundPattern(false), 3000);
  };

  return (
    <VisualizationContainer
      title="Why Summarize Data?"
      description="Understanding the critical importance of data reduction and pattern recognition"
    >
      <div className="space-y-6">
        {/* Opening Hook - Enhanced */}
        <Card className="p-6 bg-gradient-to-r from-violet-900/20 to-purple-900/20 border-violet-600/30">
          <div className="flex items-start gap-4">
            <Target className="w-8 h-8 text-violet-400 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-violet-400 mb-3">The Data Dilemma</h3>
              <p className="text-gray-300 mb-3">
                <strong>The Scenario:</strong> You're a professor with 150 exam scores. A parent asks, "How did the class do?" 
                You could read all 150 numbers: "Well, we had 78, 92, 65, 88, 71, 95, 82, 67..." (parent falls asleep) 
                OR you could say "The average was 75%, with most students scoring between 65-85%, and 80% passed."
              </p>
              <p className="text-gray-300 mb-3">
                <strong>The Problem:</strong> Our brains can only hold about 7±2 pieces of information in working memory 
                at once (Miller's Law, 1956). When faced with 150 numbers, our brains literally cannot process them all 
                simultaneously. We need to <em>compress</em> the information into digestible chunks.
              </p>
              <p className="text-gray-400 text-sm">
                <strong>The Solution:</strong> Summary statistics are like a "compression algorithm" for data. They preserve 
                the essential information while discarding the overwhelming details. Just like how a JPEG compresses an image 
                while keeping it recognizable, summary statistics compress data while keeping it meaningful.
              </p>
            </div>
          </div>
        </Card>

        {/* New: Fundamental Concepts */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-pink-400" />
            Understanding Information Overload
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <h4 className="font-medium text-pink-400 mb-2">What is "Raw Data"?</h4>
              <p className="text-sm text-gray-300 mb-2">
                Raw data is unprocessed, unorganized information straight from the source. It's like having 
                all the individual puzzle pieces scattered on a table - you have everything you need, but you 
                can't see the picture yet.
              </p>
              <div className="mt-3 p-3 bg-pink-900/10 rounded text-xs">
                <p className="text-pink-300 mb-1">Examples of raw data:</p>
                <ul className="space-y-1 text-gray-400 ml-4">
                  <li>• Every individual temperature reading from a weather station (43,200 per month!)</li>
                  <li>• Every single transaction at a store (thousands per day)</li>
                  <li>• Every keystroke in a typing test (hundreds per minute)</li>
                  <li>• Every heartbeat recorded by a fitness tracker (100,000+ per day)</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <h4 className="font-medium text-blue-400 mb-2">What is "Summarized Data"?</h4>
              <p className="text-sm text-gray-300 mb-2">
                Summarized data is processed information that captures the essence of the raw data in a 
                compact, understandable form. It's like having the completed puzzle - you see the whole 
                picture without examining every individual piece.
              </p>
              <div className="mt-3 p-3 bg-blue-900/10 rounded text-xs">
                <p className="text-blue-300 mb-1">The same data, summarized:</p>
                <ul className="space-y-1 text-gray-400 ml-4">
                  <li>• Average temperature: 72°F, Range: 58-89°F</li>
                  <li>• Daily revenue: $45,000, Peak hour: 2-3 PM</li>
                  <li>• Typing speed: 85 WPM, Accuracy: 97%</li>
                  <li>• Average heart rate: 72 BPM, Resting: 58 BPM</li>
                </ul>
              </div>
            </div>
            
            <Button
              onClick={() => setShowAnalogy(!showAnalogy)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {showAnalogy ? "Hide" : "Show"} Real-World Analogy
            </Button>
            
            {showAnalogy && (
              <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg">
                <h4 className="font-medium text-purple-400 mb-2">The Library Analogy</h4>
                <p className="text-sm text-gray-300">
                  Imagine walking into a library with 10,000 books. You want to know what the library contains.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="p-3 bg-red-900/10 rounded">
                    <p className="text-red-400 font-medium mb-1">Raw Data Approach:</p>
                    <p className="text-gray-400">Read every single book title, one by one. After 3 hours, 
                    you're on book #847 and you've already forgotten what book #1 was about.</p>
                  </div>
                  <div className="p-3 bg-green-900/10 rounded">
                    <p className="text-green-400 font-medium mb-1">Summary Approach:</p>
                    <p className="text-gray-400">Look at the library's summary: "40% Fiction, 30% Non-fiction, 
                    20% Reference, 10% Periodicals. Most popular: Mystery novels. Newest section: Computer Science."</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Which gives you a better understanding of the library in less time?
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Interactive Example: Raw vs Summarized */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Experience the Difference: 150 Exam Scores
          </h3>
          
          <div className="mb-4 flex gap-3">
            <Button
              onClick={() => setShowRawData(true)}
              variant={showRawData ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Raw Data
            </Button>
            <Button
              onClick={() => setShowRawData(false)}
              variant={!showRawData ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <EyeOff className="w-4 h-4" />
              Summarized
            </Button>
          </div>

          {showRawData ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-900/50 rounded-lg max-h-64 overflow-y-auto">
                <p className="text-xs text-gray-500 mb-2">All 150 exam scores (scroll to see all):</p>
                <div className="text-xs text-gray-400 leading-relaxed">
                  {examScores.map((score, idx) => (
                    <span key={idx} className="inline-block mr-2 mb-1">
                      {score}{idx < examScores.length - 1 ? "," : ""}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <p className="text-sm text-yellow-300 mb-2">
                  <strong>Your Challenge:</strong> Looking at these 150 numbers, try to answer:
                </p>
                <ul className="text-xs text-gray-400 space-y-1 ml-4 mb-3">
                  <li>• What score did most students get?</li>
                  <li>• How many students failed (below 60)?</li>
                  <li>• What's the typical score?</li>
                  <li>• Are scores clustered or spread out?</li>
                  <li>• Any unusual patterns?</li>
                </ul>
                <Button 
                  onClick={handlePatternSearch} 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                >
                  I tried to find patterns...
                </Button>
                {userFoundPattern && (
                  <p className="text-xs text-gray-400 mt-2">
                    <strong>Exactly!</strong> It's nearly impossible with raw data! Your brain simply can't process 
                    150 numbers at once. Let's see how summary statistics solve this...
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className={`p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-lg border border-blue-600/30 ${
                  animateNumbers ? 'animate-pulse' : ''
                }`}>
                  <p className="text-xs text-blue-400 mb-1">Class Average (Mean)</p>
                  <p className="text-2xl font-bold text-blue-300">{summaryStats.mean}%</p>
                  <p className="text-xs text-gray-500 mt-1">Sum of all scores ÷ 150</p>
                </div>
                <div className={`p-4 bg-gradient-to-br from-violet-900/20 to-violet-800/20 rounded-lg border border-violet-600/30 ${
                  animateNumbers ? 'animate-pulse animation-delay-100' : ''
                }`}>
                  <p className="text-xs text-violet-400 mb-1">Score Range</p>
                  <p className="text-2xl font-bold text-violet-300">{summaryStats.min}-{summaryStats.max}%</p>
                  <p className="text-xs text-gray-500 mt-1">Lowest to highest score</p>
                </div>
                <div className={`p-4 bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 rounded-lg border border-emerald-600/30 ${
                  animateNumbers ? 'animate-pulse animation-delay-200' : ''
                }`}>
                  <p className="text-xs text-emerald-400 mb-1">Pass Rate</p>
                  <p className="text-2xl font-bold text-emerald-300">
                    {Math.round(summaryStats.passing / examScores.length * 100)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{summaryStats.passing} passed, {summaryStats.failing} failed</p>
                </div>
              </div>
              
              {/* New: Detailed explanation of what each statistic means */}
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-3">What These Numbers Tell Us:</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400">→</span>
                    <div>
                      <strong className="text-blue-300">Mean ({summaryStats.mean}%):</strong>
                      <span className="text-gray-400 ml-1">If we redistributed all points equally, everyone would get {summaryStats.mean}%. 
                      This is the "balance point" of the data.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-violet-400">→</span>
                    <div>
                      <strong className="text-violet-300">Median ({summaryStats.median}%):</strong>
                      <span className="text-gray-400 ml-1">Half the class scored above this, half below. Less affected by 
                      extremely high or low scores than the mean.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400">→</span>
                    <div>
                      <strong className="text-emerald-300">Range ({summaryStats.max - summaryStats.min} points):</strong>
                      <span className="text-gray-400 ml-1">The spread from worst to best. A large range means diverse performance; 
                      a small range means similar performance.</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                <p className="text-sm text-green-300">
                  <strong>The Power of Summarization:</strong> In just 3 numbers, we understand more about the class 
                  performance than we could from staring at 150 individual scores for an hour! The class did well overall 
                  (mean: {summaryStats.mean}%), most students passed ({Math.round(summaryStats.passing / examScores.length * 100)}%), 
                  and performance was {summaryStats.max - summaryStats.min > 40 ? "quite varied" : "fairly consistent"}.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Four Main Reasons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reasonsToSummarize.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <Card key={idx} className="p-5 bg-gray-800/50 hover:bg-gray-800/60 transition-all">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${reason.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{reason.title}</h4>
                    <p className="text-xs text-gray-400 mb-2">{reason.description}</p>
                    <div className="p-2 bg-gray-900/50 rounded">
                      <p className="text-xs text-gray-300">
                        <span className="text-gray-500">Example:</span> {reason.example}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Real-World Examples */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            Real-World Applications
          </h3>
          
          <div className="space-y-3">
            {realWorldExamples.map((example, idx) => {
              const Icon = example.icon;
              const isSelected = selectedExample === idx;
              
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-gray-700/50 border border-gray-600' 
                      : 'bg-gray-900/30 hover:bg-gray-900/50'
                  }`}
                  onClick={() => setSelectedExample(isSelected ? -1 : idx)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${example.color} mt-1`} />
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{example.title}</h4>
                      
                      {isSelected && (
                        <div className="space-y-2 mt-3">
                          <div className="p-2 bg-red-900/20 rounded">
                            <p className="text-xs text-red-300">
                              <strong>Raw Data:</strong> {example.raw}
                            </p>
                          </div>
                          <div className="p-2 bg-green-900/20 rounded">
                            <p className="text-xs text-green-300">
                              <strong>Summarized:</strong> {example.summarized}
                            </p>
                          </div>
                          <div className="p-2 bg-blue-900/20 rounded">
                            <p className="text-xs text-blue-300">
                              <strong>Benefit:</strong> {example.benefit}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {!isSelected && (
                        <p className="text-xs text-gray-500">Click to see transformation</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* The Cost of Not Summarizing */}
        <Card className="p-6 bg-red-900/20 border-red-600/30">
          <h3 className="text-lg font-semibold mb-4 text-red-400">The Cost of Not Summarizing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <h4 className="font-medium text-red-400">Time Wasted</h4>
              <p className="text-xs text-gray-400 mt-1">
                Hours spent trying to understand patterns that summary statistics reveal in seconds
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">❌</div>
              <h4 className="font-medium text-red-400">Poor Decisions</h4>
              <p className="text-xs text-gray-400 mt-1">
                Missing important trends leads to uninformed choices and missed opportunities
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">😵</div>
              <h4 className="font-medium text-red-400">Analysis Paralysis</h4>
              <p className="text-xs text-gray-400 mt-1">
                Too much information prevents action - you can't see the forest for the trees
              </p>
            </div>
          </div>
        </Card>

        {/* Summary Hierarchy */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            The Summarization Hierarchy
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-16 text-xs text-gray-500">Raw</div>
              <div className="flex-1 p-3 bg-gray-900/50 rounded">
                <p className="text-sm">10,000 individual data points</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-16 text-xs text-gray-500">Basic</div>
              <div className="flex-1 p-3 bg-blue-900/20 rounded">
                <p className="text-sm">Mean, Median, Range</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-16 text-xs text-gray-500">Advanced</div>
              <div className="flex-1 p-3 bg-violet-900/20 rounded">
                <p className="text-sm">Variance, Skewness, Percentiles</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-16 text-xs text-gray-500">Visual</div>
              <div className="flex-1 p-3 bg-emerald-900/20 rounded">
                <p className="text-sm">Histograms, Box Plots, Dashboards</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-16 text-xs text-gray-500">Insight</div>
              <div className="flex-1 p-3 bg-gradient-to-r from-emerald-900/30 to-blue-900/30 rounded border border-emerald-600/30">
                <p className="text-sm font-medium text-emerald-300">
                  "Sales increased 20% last quarter, driven by new customers"
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 mt-4">
            Each level reduces complexity while preserving essential information
          </p>
        </Card>

        {/* Key Takeaway */}
        <div className="p-4 bg-emerald-900/20 border border-emerald-600/30 rounded-lg">
          <p className="text-sm text-emerald-300">
            <strong className="text-emerald-400">Remember:</strong> Data summarization isn't about losing 
            information - it's about making information usable. Raw data is like an uncut diamond; summary 
            statistics are the polished gem that reveals its true value.
          </p>
        </div>
      </div>
    </VisualizationContainer>
  );
};

export default WhySummarizeData;