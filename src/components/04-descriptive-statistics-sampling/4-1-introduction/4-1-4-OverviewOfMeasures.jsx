"use client";

import React, { useState } from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizBreak } from "@/components/mdx/QuizBreak";
import { 
  Target, TrendingUp, Activity, BoxSelect, 
  BarChart3, PieChart, Layers, ArrowRight,
  CheckCircle, Circle, Info, Map, Compass,
  Ruler, Gauge, Mountain, Binary
} from "lucide-react";

const OverviewOfMeasures = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredMeasure, setHoveredMeasure] = useState(null);
  const [showFoundations, setShowFoundations] = useState(false);
  const [expandedAnalogy, setExpandedAnalogy] = useState(null);
  const [selfCheckCompleted, setSelfCheckCompleted] = useState(false);

  // Main categories of statistical measures
  const measureCategories = {
    central: {
      title: "Measures of Central Tendency",
      subtitle: "Where is the center?",
      icon: Target,
      color: "from-blue-500 to-indigo-500",
      borderColor: "border-blue-600/30",
      measures: [
        {
          name: "Mean",
          symbol: "x̄",
          description: "The arithmetic average",
          when: "When data is roughly symmetric",
          formula: "Sum of all values ÷ Number of values",
          example: "Average GPA: 3.45",
          sensitivity: "Very sensitive to outliers"
        },
        {
          name: "Median",
          symbol: "M",
          description: "The middle value when sorted",
          when: "When data has outliers or is skewed",
          formula: "Middle value (or average of two middle values)",
          example: "Median home price: $425,000",
          sensitivity: "Resistant to outliers"
        },
        {
          name: "Mode",
          symbol: "Mo",
          description: "The most frequent value",
          when: "For categorical data or finding peaks",
          formula: "Value that appears most often",
          example: "Most common major: Computer Science",
          sensitivity: "Not affected by outliers"
        }
      ]
    },
    variability: {
      title: "Measures of Variability",
      subtitle: "How spread out is the data?",
      icon: Activity,
      color: "from-violet-500 to-purple-500",
      borderColor: "border-violet-600/30",
      measures: [
        {
          name: "Range",
          symbol: "R",
          description: "Difference between max and min",
          when: "Quick sense of spread",
          formula: "Maximum - Minimum",
          example: "Score range: 55-98",
          sensitivity: "Very sensitive to outliers"
        },
        {
          name: "Variance",
          symbol: "s²",
          description: "Average squared deviation from mean",
          when: "Mathematical calculations",
          formula: "Σ(x - x̄)² / (n-1)",
          example: "Variance: 144",
          sensitivity: "Sensitive to outliers (squared effect)"
        },
        {
          name: "Standard Deviation",
          symbol: "s",
          description: "Typical distance from mean",
          when: "Understanding typical variation",
          formula: "√Variance",
          example: "SD: 12 points",
          sensitivity: "Sensitive to outliers"
        },
        {
          name: "IQR",
          symbol: "IQR",
          description: "Range of middle 50% of data",
          when: "Robust measure of spread",
          formula: "Q3 - Q1",
          example: "IQR: 15 points",
          sensitivity: "Resistant to outliers"
        }
      ]
    },
    position: {
      title: "Measures of Position",
      subtitle: "Where does a value stand?",
      icon: Compass,
      color: "from-emerald-500 to-teal-500",
      borderColor: "border-emerald-600/30",
      measures: [
        {
          name: "Percentiles",
          symbol: "Pₖ",
          description: "Value below which k% of data falls",
          when: "Comparing individual performance",
          formula: "Position = k(n+1)/100",
          example: "90th percentile: Score of 92",
          sensitivity: "Robust measure"
        },
        {
          name: "Quartiles",
          symbol: "Q₁, Q₂, Q₃",
          description: "Divide data into four equal parts",
          when: "Understanding data distribution",
          formula: "25th, 50th, 75th percentiles",
          example: "Q1=65, Q2=75, Q3=85",
          sensitivity: "Resistant to outliers"
        },
        {
          name: "Z-Score",
          symbol: "z",
          description: "Number of SDs from mean",
          when: "Standardizing different scales",
          formula: "(x - μ) / σ",
          example: "z = 1.5 (1.5 SDs above mean)",
          sensitivity: "Affected by outliers in mean/SD"
        }
      ]
    },
    shape: {
      title: "Measures of Shape",
      subtitle: "What does the distribution look like?",
      icon: Mountain,
      color: "from-orange-500 to-red-500",
      borderColor: "border-orange-600/30",
      measures: [
        {
          name: "Skewness",
          symbol: "g₁",
          description: "Asymmetry of distribution",
          when: "Checking distribution symmetry",
          formula: "Σ((x - x̄)/s)³ / n",
          example: "Positive skew (tail to right)",
          sensitivity: "Very sensitive to outliers"
        },
        {
          name: "Kurtosis",
          symbol: "g₂",
          description: "Peakedness and tail weight",
          when: "Comparing to normal distribution",
          formula: "Σ((x - x̄)/s)⁴ / n - 3",
          example: "Leptokurtic (heavy tails)",
          sensitivity: "Extremely sensitive to outliers"
        }
      ]
    }
  };

  // Statistical categories progression
  const learningPath = [
    { category: "central", topics: 3 },
    { category: "variability", topics: 4 },
    { category: "position", topics: 3 },
    { category: "shape", topics: 2 }
  ];

  // Self-check questions for QuizBreak component
  const selfCheckQuestions = [
    {
      question: "Your dataset has extreme outliers. Which measure of central tendency should you use?",
      options: ["Mean", "Median", "Mode"],
      correctIndex: 1,
      explanation: "Median is resistant to outliers, while mean is heavily affected by them. For example, if most salaries are $50,000 but the CEO makes $10 million, the mean will be misleadingly high, but the median will still represent the typical employee."
    },
    {
      question: "You want to know the typical spread in your data. Which measure is most interpretable?",
      options: ["Variance", "Standard Deviation", "Range"],
      correctIndex: 1,
      explanation: "Standard deviation is in the same units as your data, making it most interpretable. Variance is in squared units (e.g., dollars²), which is harder to understand. Range only tells you the extremes, not the typical spread."
    },
    {
      question: "You need to compare test scores from different exams with different scales. What should you use?",
      options: ["Percentiles", "Raw scores", "Z-scores"],
      correctIndex: 2,
      explanation: "Z-scores standardize values across different scales, allowing fair comparison. A z-score of 1.5 means you're 1.5 standard deviations above the mean, regardless of whether the test was out of 100 or 1000 points."
    }
  ];

  return (
    <VisualizationContainer
      title="Overview of Statistical Measures"
      description="Your complete roadmap to mastering descriptive statistics"
    >
      <div className="space-y-6">
        {/* Introduction - Much More Detailed */}
        <Card className="p-6 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-emerald-600/30">
          <div className="flex items-start gap-4">
            <Map className="w-8 h-8 text-emerald-400 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-emerald-400 mb-3">Your Statistical Toolkit</h3>
              <p className="text-gray-300 mb-3">
                Think of statistical measures as tools in a toolkit. Each tool has a specific purpose - 
                you wouldn't use a hammer to cut wood! Similarly, each statistical measure answers a 
                different question about your data.
              </p>
              <p className="text-gray-300 mb-3">
                <strong>The Big Picture:</strong> Every dataset tells a story, but that story has multiple dimensions. 
                Where is the center? How spread out is it? What shape does it take? Where do individual values stand? 
                Each category of measures reveals a different aspect of your data's story.
              </p>
              <p className="text-gray-400 text-sm">
                <strong>Complete Overview:</strong> This overview maps out all 12 core statistical measures. 
                Don't worry about memorizing everything now - think of this as your roadmap. You'll explore each measure 
                in depth.
              </p>
            </div>
          </div>
        </Card>

        {/* New: Foundational Understanding */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-yellow-400" />
            Before We Begin: What Are Statistical Measures?
          </h3>
          
          <Button
            onClick={() => setShowFoundations(!showFoundations)}
            variant="outline"
            className="mb-4"
          >
            {showFoundations ? "Hide" : "Show"} Foundational Concepts
          </Button>
          
          {showFoundations && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <h4 className="font-medium text-yellow-400 mb-2">What is a "measure" in statistics?</h4>
                <p className="text-sm text-gray-300 mb-2">
                  A statistical measure is a single number that captures some important characteristic of your entire dataset. 
                  It's like taking a photograph of a crowd - you lose individual details but gain an overall impression.
                </p>
                <div className="mt-3 p-3 bg-yellow-900/10 rounded text-xs">
                  <p className="text-yellow-300 mb-1">Examples in everyday life:</p>
                  <ul className="space-y-1 text-gray-400 ml-4">
                    <li>• Your GPA is a measure of your academic performance</li>
                    <li>• Your credit score is a measure of your financial reliability</li>
                    <li>• A movie's rating is a measure of audience satisfaction</li>
                    <li>• Your pulse is a measure of your heart's activity</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <h4 className="font-medium text-blue-400 mb-2">Why do we need different types of measures?</h4>
                <p className="text-sm text-gray-300 mb-2">
                  Just like you can't describe a person with just their height, you can't describe data with just one number. 
                  Different measures answer different questions:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="p-2 bg-blue-900/10 rounded">
                    <p className="text-blue-300 font-medium">Question → Measure</p>
                    <p className="text-gray-400 mt-1">"What's typical?" → Mean/Median</p>
                    <p className="text-gray-400">"How consistent?" → Std Deviation</p>
                    <p className="text-gray-400">"Where do I stand?" → Percentile</p>
                  </div>
                  <div className="p-2 bg-violet-900/10 rounded">
                    <p className="text-violet-300 font-medium">Real Example</p>
                    <p className="text-gray-400 mt-1">Test scores: Mean = 75</p>
                    <p className="text-gray-400">Std Dev = 10 (consistent)</p>
                    <p className="text-gray-400">Your score = 85 (90th percentile!)</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 rounded-lg">
                <h4 className="font-medium text-emerald-400 mb-2">The Restaurant Menu Analogy</h4>
                <p className="text-sm text-gray-300">
                  Imagine describing a restaurant using only one measure:
                </p>
                <ul className="space-y-2 text-xs text-gray-400 mt-3 ml-4">
                  <li>
                    <strong className="text-emerald-300">Average price ($25):</strong> Tells you it's mid-range, but not 
                    if all dishes are $25 or if there's a mix of $5 appetizers and $45 entrees.
                  </li>
                  <li>
                    <strong className="text-blue-300">Price range ($8-$65):</strong> Shows variety, but not what's typical.
                  </li>
                  <li>
                    <strong className="text-violet-300">Most common price ($22):</strong> Popular price point, but misses 
                    the expensive steaks.
                  </li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  <strong>The lesson:</strong> You need multiple measures to get the full picture!
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Interactive Mind Map */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Interactive Statistics Map - Click to Explore
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.entries(measureCategories).map(([key, category]) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === key;
              
              return (
                <Card
                  key={key}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 bg-gray-700/50' : 'bg-gray-800/50 hover:bg-gray-700/40'
                  }`}
                  onClick={() => setSelectedCategory(isSelected ? null : key)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{category.title}</h4>
                      <p className="text-xs text-gray-400 mb-2">{category.subtitle}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">{category.measures.length} measures</span>
                        {isSelected && <ArrowRight className="w-3 h-3 text-blue-400" />}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Detailed View - Enhanced with More Explanations */}
          {selectedCategory && (
            <div className="space-y-3 p-4 bg-gray-900/30 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-3">
                {measureCategories[selectedCategory].title} - Detailed View
              </h4>
              
              {/* Category-specific introduction */}
              <div className="p-3 bg-gray-800/50 rounded mb-4">
                <p className="text-xs text-gray-400">
                  {selectedCategory === 'central' && (
                    <>
                      <strong className="text-blue-300">Central Tendency</strong> measures answer: "What's a typical value?" 
                      They give us a single number to represent the entire dataset. But "typical" can mean different things - 
                      the arithmetic center (mean), the middle value (median), or the most common value (mode).
                    </>
                  )}
                  {selectedCategory === 'variability' && (
                    <>
                      <strong className="text-violet-300">Variability</strong> measures answer: "How spread out is the data?" 
                      Two datasets can have the same mean but be completely different - one tightly clustered, one widely scattered. 
                      These measures quantify that spread.
                    </>
                  )}
                  {selectedCategory === 'position' && (
                    <>
                      <strong className="text-emerald-300">Position</strong> measures answer: "Where does a specific value stand?" 
                      They help you understand if a value is typical, exceptional, or somewhere in between by comparing it to the rest 
                      of the data.
                    </>
                  )}
                  {selectedCategory === 'shape' && (
                    <>
                      <strong className="text-orange-300">Shape</strong> measures answer: "What does the distribution look like?" 
                      Is it symmetric like a bell curve? Skewed with a long tail? These measures quantify the visual shape of your data.
                    </>
                  )}
                </p>
              </div>
              
              {measureCategories[selectedCategory].measures.map((measure, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg transition-all cursor-pointer ${
                    hoveredMeasure === `${selectedCategory}-${idx}`
                      ? 'bg-gray-700/50 border border-gray-600'
                      : 'bg-gray-800/50 hover:bg-gray-700/40'
                  }`}
                  onMouseEnter={() => setHoveredMeasure(`${selectedCategory}-${idx}`)}
                  onMouseLeave={() => setHoveredMeasure(null)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-medium flex items-center gap-2">
                        {measure.name}
                        <span className="text-xs px-2 py-1 bg-gray-700 rounded font-mono">
                          {measure.symbol}
                        </span>
                      </h5>
                      <p className="text-sm text-gray-400">{measure.description}</p>
                    </div>
                  </div>
                  
                  {hoveredMeasure === `${selectedCategory}-${idx}` && (
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="p-2 bg-blue-900/20 rounded">
                        <strong className="text-blue-400">When to use:</strong> {measure.when}
                      </div>
                      <div className="p-2 bg-violet-900/20 rounded">
                        <strong className="text-violet-400">Formula:</strong> <code>{measure.formula}</code>
                      </div>
                      <div className="p-2 bg-emerald-900/20 rounded">
                        <strong className="text-emerald-400">Example:</strong> {measure.example}
                      </div>
                      <div className="p-2 bg-orange-900/20 rounded">
                        <strong className="text-orange-400">Important:</strong> {measure.sensitivity}
                      </div>
                      
                      {/* Additional intuitive explanation */}
                      <div className="p-2 bg-pink-900/20 rounded">
                        <strong className="text-pink-400">Intuition:</strong>
                        {measure.name === "Mean" && " Add up everything and divide by count - the 'fair share' value."}
                        {measure.name === "Median" && " Line everyone up in order and pick the middle person - unaffected by extremes."}
                        {measure.name === "Mode" && " The value you're most likely to encounter if you pick randomly."}
                        {measure.name === "Range" && " The full span from smallest to largest - how much territory your data covers."}
                        {measure.name === "Variance" && " The average of squared distances from mean - big deviations get extra weight."}
                        {measure.name === "Standard Deviation" && " The 'typical' distance from the mean - in the same units as your data."}
                        {measure.name === "IQR" && " The range of the 'middle class' of your data - ignores the extremes."}
                        {measure.name === "Percentiles" && " Your ranking in the data - like saying you're in the top 10%."}
                        {measure.name === "Quartiles" && " Dividing data into four equal groups - like income classes."}
                        {measure.name === "Z-Score" && " How many 'typical distances' you are from average - your uniqueness score."}
                        {measure.name === "Skewness" && " Which way the data leans - like a tower tilting left or right."}
                        {measure.name === "Kurtosis" && " How peaked and heavy-tailed - sharp mountain vs gentle hill."}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Statistical Categories Overview */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            Statistical Categories
          </h3>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-600"></div>
            
            {/* Timeline items */}
            <div className="space-y-6">
              {learningPath.map((item, idx) => {
                const category = measureCategories[item.category];
                const Icon = category.icon;
                
                return (
                  <div key={idx} className="flex gap-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center relative z-10`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{category.title}</h4>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-700 rounded">
                          {item.topics} topics
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{category.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Quick Decision Tree */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Binary className="w-5 h-5 text-emerald-400" />
            Which Measure Should I Use?
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <h4 className="font-medium text-blue-400 mb-3">Finding the Center</h4>
              <div className="pl-4 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-gray-300">Data has outliers?</span>
                    <span className="text-blue-400 ml-2">→ Use Median</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-gray-300">Categorical data?</span>
                    <span className="text-blue-400 ml-2">→ Use Mode</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-gray-300">Symmetric numerical data?</span>
                    <span className="text-blue-400 ml-2">→ Use Mean</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-lg">
              <h4 className="font-medium text-violet-400 mb-3">Measuring Spread</h4>
              <div className="pl-4 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-gray-300">Need robust measure?</span>
                    <span className="text-violet-400 ml-2">→ Use IQR</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-gray-300">Working with normal data?</span>
                    <span className="text-violet-400 ml-2">→ Use Standard Deviation</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-gray-300">Quick overview needed?</span>
                    <span className="text-violet-400 ml-2">→ Use Range</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Self-Check Quiz - Using Gold Standard QuizBreak Component */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-orange-400" />
            Quick Self-Check
          </h3>
          
          <p className="text-gray-300 mb-6">
            Test your understanding of when to use different statistical measures. These are common scenarios you'll encounter in real data analysis.
          </p>
          
          <QuizBreak
            questions={selfCheckQuestions}
            onComplete={() => setSelfCheckCompleted(true)}
          />
          
          {selfCheckCompleted && (
            <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-600/30 rounded-lg">
              <p className="text-sm text-emerald-300">
                <strong className="text-emerald-400">Great job!</strong> You've demonstrated understanding of when to use different statistical measures. 
                This knowledge is crucial for choosing the right tools for your data analysis. Remember: The context of your data and your 
                analysis goals should always guide your choice of statistical measures!
              </p>
            </div>
          )}
        </Card>

        {/* Visual Summary */}
        <Card className="p-6 bg-gradient-to-r from-blue-900/20 to-violet-900/20 border-blue-600/30">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-400" />
            The Big Picture
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400">4</div>
              <p className="text-xs text-gray-400">Categories</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-violet-400">12</div>
              <p className="text-xs text-gray-400">Core Measures</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">4</div>
              <p className="text-xs text-gray-400">Key Areas</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400">∞</div>
              <p className="text-xs text-gray-400">Applications</p>
            </div>
          </div>
        </Card>

        {/* Final Thoughts */}
        <div className="p-4 bg-emerald-900/20 border border-emerald-600/30 rounded-lg">
          <p className="text-sm text-emerald-300">
            <strong className="text-emerald-400">Getting Started:</strong> Don't feel overwhelmed! 
            These measures form a comprehensive toolkit for understanding data. Each measure 
            builds on the previous ones, creating a complete picture of how to understand and describe data. 
            With practice, you'll know exactly which tool to use for any data analysis challenge!
          </p>
        </div>
      </div>
    </VisualizationContainer>
  );
};

export default OverviewOfMeasures;