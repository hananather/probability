"use client";

import React, { useState } from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, Database, BarChart3, Calculator, CheckCircle, AlertCircle, Target } from "lucide-react";

const IntroductionToDescriptiveStats = () => {
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  const [showPracticeProblems, setShowPracticeProblems] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState({});
  return (
    <VisualizationContainer
      title="What Are Descriptive Statistics?"
      description="Understanding the foundation of data analysis"
    >
      <div className="space-y-6">
        {/* Main concept */}
        <Card className="p-6 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-emerald-600/30">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-emerald-400 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-emerald-400 mb-3">Definition</h3>
              <p className="text-gray-300 mb-4">
                <strong>Descriptive statistics</strong> are methods for organizing, displaying, and describing 
                data by using tables, graphs, and summary measures. They transform raw data into a form 
                that is easier to understand and interpret.
              </p>
              <p className="text-gray-400 text-sm">
                Unlike inferential statistics (which make predictions), descriptive statistics simply 
                describe what the data shows.
              </p>
            </div>
          </div>
        </Card>

        {/* Why we need them */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Why Do We Need Descriptive Statistics?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <h4 className="font-medium text-blue-400 mb-2">Problem: Raw Data Overload</h4>
              <p className="text-sm text-gray-400">
                Imagine 10,000 customer purchase amounts. Looking at each number tells you nothing 
                about patterns or trends.
              </p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <h4 className="font-medium text-green-400 mb-2">Solution: Summarization</h4>
              <p className="text-sm text-gray-400">
                Descriptive statistics give us the average purchase ($47.23), the spread ($15-$250), 
                and the most common amount ($35).
              </p>
            </div>
          </div>
        </Card>

        {/* New: Mathematical Foundations */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-yellow-400" />
            Mathematical Foundations: Population vs Sample
          </h3>
          <div className="space-y-4">
            {/* Population Parameters */}
            <div className="p-4 bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-lg border border-blue-600/30">
              <h4 className="font-medium text-blue-400 mb-3">Population Parameters (Fixed but Unknown)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-300 mb-2"><strong>Notation:</strong></p>
                  <ul className="space-y-1 text-gray-400 ml-4">
                    <li>• Size: N (all items)</li>
                    <li>• Mean: μ (mu)</li>
                    <li>• Variance: σ² (sigma squared)</li>
                    <li>• Std Dev: σ (sigma)</li>
                  </ul>
                </div>
                <div>
                  <p className="text-gray-300 mb-2"><strong>Formulas:</strong></p>
                  <div className="space-y-2 text-xs font-mono bg-gray-900/50 p-2 rounded">
                    <p>μ = (1/N) Σ Xᵢ</p>
                    <p>σ² = (1/N) Σ (Xᵢ - μ)²</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sample Statistics */}
            <div className="p-4 bg-gradient-to-r from-violet-900/20 to-violet-800/20 rounded-lg border border-violet-600/30">
              <h4 className="font-medium text-violet-400 mb-3">Sample Statistics (Calculated from Data)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-300 mb-2"><strong>Notation:</strong></p>
                  <ul className="space-y-1 text-gray-400 ml-4">
                    <li>• Size: n (subset)</li>
                    <li>• Mean: x̄ (x-bar)</li>
                    <li>• Variance: s²</li>
                    <li>• Std Dev: s</li>
                  </ul>
                </div>
                <div>
                  <p className="text-gray-300 mb-2"><strong>Formulas:</strong></p>
                  <div className="space-y-2 text-xs font-mono bg-gray-900/50 p-2 rounded">
                    <p>x̄ = (1/n) Σ xᵢ</p>
                    <p>s² = 1/(n-1) Σ (xᵢ - x̄)²</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Key Insight */}
            <div className="p-3 bg-emerald-900/20 border border-emerald-600/30 rounded-lg">
              <p className="text-sm text-emerald-300">
                <strong className="text-emerald-400">Critical Insight:</strong> We use n-1 (not n) in sample variance 
                for unbiasedness. This "Bessel's correction" accounts for using x̄ instead of the unknown μ.
              </p>
            </div>
          </div>
        </Card>
        
        {/* Complete Worked Example */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            Complete Worked Example: Analyzing Test Scores
          </h3>
          
          <Button
            onClick={() => setShowWorkedExample(!showWorkedExample)}
            variant="outline"
            className="mb-4"
          >
            {showWorkedExample ? "Hide" : "Show"} Step-by-Step Analysis
          </Button>
          
          {showWorkedExample && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <h4 className="font-medium text-orange-400 mb-2">Dataset: Quiz Scores (out of 100)</h4>
                <p className="text-sm font-mono text-gray-300 mb-3">
                  [78, 85, 92, 67, 88, 91, 73, 84, 79, 86]
                </p>
                
                {/* Step 1: Organize */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-blue-400 mb-2">Step 1: Organize Data (Sort)</h5>
                  <p className="text-sm font-mono text-gray-400">
                    [67, 73, 78, 79, 84, 85, 86, 88, 91, 92]
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Sorting helps identify outliers, find median, and see the distribution.
                  </p>
                </div>
                
                {/* Step 2: Calculate Mean */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-blue-400 mb-2">Step 2: Calculate Mean</h5>
                  <div className="text-sm font-mono text-gray-400 space-y-1">
                    <p>Σ xᵢ = 67 + 73 + 78 + 79 + 84 + 85 + 86 + 88 + 91 + 92</p>
                    <p>Σ xᵢ = 823</p>
                    <p>x̄ = 823 / 10 = <span className="text-blue-300">82.3</span></p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Interpretation: The average score is 82.3%, a B grade.
                  </p>
                </div>
                
                {/* Step 3: Find Median */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-blue-400 mb-2">Step 3: Find Median</h5>
                  <div className="text-sm text-gray-400">
                    <p className="font-mono">n = 10 (even), so median = average of 5th and 6th values</p>
                    <p className="font-mono">Median = (84 + 85) / 2 = <span className="text-violet-300">84.5</span></p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    The median (84.5) &gt; mean (82.3), suggesting slight negative skew.
                  </p>
                </div>
                
                {/* Step 4: Identify Mode */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-blue-400 mb-2">Step 4: Identify Mode</h5>
                  <p className="text-sm text-gray-400">
                    No repeated values, so <span className="text-emerald-300">no mode</span>.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    In continuous data, having no mode is common.
                  </p>
                </div>
                
                {/* Step 5: Calculate Variance */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-blue-400 mb-2">Step 5: Calculate Sample Variance</h5>
                  <div className="text-xs font-mono text-gray-400 space-y-1">
                    <p>(67-82.3)² = 234.09</p>
                    <p>(73-82.3)² = 86.49</p>
                    <p>(78-82.3)² = 18.49</p>
                    <p>(79-82.3)² = 10.89</p>
                    <p>(84-82.3)² = 2.89</p>
                    <p>(85-82.3)² = 7.29</p>
                    <p>(86-82.3)² = 13.69</p>
                    <p>(88-82.3)² = 32.49</p>
                    <p>(91-82.3)² = 75.69</p>
                    <p>(92-82.3)² = 94.09</p>
                    <p className="border-t pt-1">Σ = 576.10</p>
                    <p>s² = 576.10 / 9 = <span className="text-red-300">64.01</span></p>
                    <p>s = √64.01 = <span className="text-red-300">8.00</span></p>
                  </div>
                </div>
                
                {/* Interpretation */}
                <div className="p-3 bg-emerald-900/20 rounded-lg">
                  <h5 className="text-sm font-medium text-emerald-400 mb-2">Final Interpretation</h5>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• <strong>Central Tendency:</strong> Students averaged 82.3% (B grade)</li>
                    <li>• <strong>Variability:</strong> Standard deviation of 8 points shows moderate spread</li>
                    <li>• <strong>Range:</strong> 67 to 92 (25-point spread)</li>
                    <li>• <strong>Distribution:</strong> Slightly negatively skewed (one low outlier at 67)</li>
                    <li>• <strong>Conclusion:</strong> Class performed well overall with consistent scores</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Card>
        
        {/* Statistical Process */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            The Statistical Process: From Data to Decisions
          </h3>
          <div className="space-y-4">
            {/* Process Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-medium text-cyan-400 text-sm">1. Collect</h4>
                <p className="text-xs text-gray-400 mt-1">Gather raw data</p>
              </div>
              <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                <div className="text-2xl mb-2">🔍</div>
                <h4 className="font-medium text-cyan-400 text-sm">2. Describe</h4>
                <p className="text-xs text-gray-400 mt-1">Summarize patterns</p>
              </div>
              <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                <div className="text-2xl mb-2">📈</div>
                <h4 className="font-medium text-cyan-400 text-sm">3. Analyze</h4>
                <p className="text-xs text-gray-400 mt-1">Find relationships</p>
              </div>
              <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-medium text-cyan-400 text-sm">4. Infer</h4>
                <p className="text-xs text-gray-400 mt-1">Make conclusions</p>
              </div>
            </div>
            
            {/* Descriptive vs Inferential */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-400 mb-2">Descriptive Statistics</h4>
                <p className="text-sm text-gray-300 mb-2">What happened?</p>
                <ul className="text-xs text-gray-400 space-y-1 ml-4">
                  <li>• Summarize data you have</li>
                  <li>• No uncertainty</li>
                  <li>• Example: Class average was 82.3%</li>
                </ul>
              </div>
              <div className="p-4 bg-violet-900/20 rounded-lg">
                <h4 className="font-medium text-violet-400 mb-2">Inferential Statistics</h4>
                <p className="text-sm text-gray-300 mb-2">What might happen?</p>
                <ul className="text-xs text-gray-400 space-y-1 ml-4">
                  <li>• Generalize to population</li>
                  <li>• Includes uncertainty</li>
                  <li>• Example: All students would average 80-85%</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Three main branches */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-violet-400" />
            Three Main Branches of Descriptive Statistics
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-lg border border-blue-600/30">
              <h4 className="font-medium text-blue-400 mb-2">1. Measures of Central Tendency</h4>
              <p className="text-sm text-gray-300">Where is the center of your data?</p>
              <p className="text-xs text-gray-500 mt-1">Mean, Median, Mode</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-violet-900/20 to-violet-800/20 rounded-lg border border-violet-600/30">
              <h4 className="font-medium text-violet-400 mb-2">2. Measures of Variability</h4>
              <p className="text-sm text-gray-300">How spread out is your data?</p>
              <p className="text-xs text-gray-500 mt-1">Range, Variance, Standard Deviation</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-emerald-800/20 rounded-lg border border-emerald-600/30">
              <h4 className="font-medium text-emerald-400 mb-2">3. Data Visualization</h4>
              <p className="text-sm text-gray-300">What patterns can we see?</p>
              <p className="text-xs text-gray-500 mt-1">Histograms, Box Plots, Scatter Plots</p>
            </div>
          </div>
        </Card>

        {/* Practice Problems */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Practice Problems: Test Your Understanding
          </h3>
          
          <Button
            onClick={() => setShowPracticeProblems(!showPracticeProblems)}
            variant="outline"
            className="mb-4"
          >
            {showPracticeProblems ? "Hide" : "Show"} Practice Problems
          </Button>
          
          {showPracticeProblems && (
            <div className="space-y-4">
              {/* Problem 1 */}
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <h4 className="font-medium text-green-400 mb-2">Problem 1: Calculate Statistics</h4>
                <p className="text-sm text-gray-300 mb-2">
                  Given data: [15, 20, 25, 30, 35]
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  Calculate the mean, median, and standard deviation.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => setSelectedAnswer({...selectedAnswer, p1: !selectedAnswer.p1})}
                    variant="outline"
                    size="sm"
                  >
                    {selectedAnswer.p1 ? "Hide" : "Show"} Solution
                  </Button>
                  {selectedAnswer.p1 && (
                    <div className="p-3 bg-green-900/20 rounded text-xs">
                      <p className="font-mono">Mean = (15+20+25+30+35)/5 = 125/5 = 25</p>
                      <p className="font-mono">Median = 25 (middle value)</p>
                      <p className="font-mono">Variance = [(15-25)² + ... + (35-25)²]/4 = 62.5</p>
                      <p className="font-mono">Std Dev = √62.5 = 7.91</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Problem 2 */}
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <h4 className="font-medium text-green-400 mb-2">Problem 2: Choose the Right Measure</h4>
                <p className="text-sm text-gray-300 mb-2">
                  House prices in a neighborhood: Most homes ~$300k, but one mansion at $5 million.
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  Which measure of central tendency best represents typical home price?
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => setSelectedAnswer({...selectedAnswer, p2: !selectedAnswer.p2})}
                    variant="outline"
                    size="sm"
                  >
                    {selectedAnswer.p2 ? "Hide" : "Show"} Solution
                  </Button>
                  {selectedAnswer.p2 && (
                    <div className="p-3 bg-green-900/20 rounded text-xs text-gray-300">
                      <p><strong>Answer: Median</strong></p>
                      <p className="mt-2">The mansion is an extreme outlier that would pull the mean 
                      far above what most homes cost. The median is resistant to outliers and better 
                      represents the "typical" home price of ~$300k.</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Problem 3 */}
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <h4 className="font-medium text-green-400 mb-2">Problem 3: Interpret Statistics</h4>
                <p className="text-sm text-gray-300 mb-2">
                  Class A: Mean = 75, SD = 5<br />
                  Class B: Mean = 75, SD = 15
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  Which class has more consistent performance? Explain.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => setSelectedAnswer({...selectedAnswer, p3: !selectedAnswer.p3})}
                    variant="outline"
                    size="sm"
                  >
                    {selectedAnswer.p3 ? "Hide" : "Show"} Solution
                  </Button>
                  {selectedAnswer.p3 && (
                    <div className="p-3 bg-green-900/20 rounded text-xs text-gray-300">
                      <p><strong>Answer: Class A is more consistent</strong></p>
                      <p className="mt-2">Both classes have the same average (75), but Class A has 
                      SD = 5 (scores mostly between 70-80) while Class B has SD = 15 (scores spread 
                      from 60-90). Lower standard deviation means more consistency.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
        
        {/* Real-world applications */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            Real-World Applications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🏥</div>
              <h4 className="font-medium text-orange-400">Healthcare</h4>
              <p className="text-xs text-gray-400 mt-1">
                Average patient wait times, treatment effectiveness rates
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">💼</div>
              <h4 className="font-medium text-orange-400">Business</h4>
              <p className="text-xs text-gray-400 mt-1">
                Sales trends, customer satisfaction scores, inventory levels
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🎓</div>
              <h4 className="font-medium text-orange-400">Education</h4>
              <p className="text-xs text-gray-400 mt-1">
                Test score distributions, graduation rates, class performance
              </p>
            </div>
          </div>
        </Card>

        {/* Key takeaway */}
        <div className="p-4 bg-emerald-900/20 border border-emerald-600/30 rounded-lg">
          <p className="text-sm text-emerald-300">
            <strong className="text-emerald-400">Key Takeaway:</strong> Descriptive statistics are your 
            first tool for making sense of data. They don't tell you why something happened or predict 
            the future - they simply describe what you have in a clear, concise way.
          </p>
        </div>
      </div>
    </VisualizationContainer>
  );
};

export default IntroductionToDescriptiveStats;