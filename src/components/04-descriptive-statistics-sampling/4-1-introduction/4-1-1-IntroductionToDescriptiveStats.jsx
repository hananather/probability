"use client";

import React from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { Card } from "@/components/ui/card";
import { BookOpen, TrendingUp, Database, BarChart3 } from "lucide-react";

const IntroductionToDescriptiveStats = () => {
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

        {/* Three main branches */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-violet-400" />
            Three Main Branches
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