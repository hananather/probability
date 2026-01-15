"use client";

import React, { useState } from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizBreak } from "@/components/mdx/QuizBreak";
import { Database, Hash, Tags, Layers, ArrowRight, Check, X, AlertCircle, Binary, Target, Table, BookOpen, Calculator } from "lucide-react";

const TypesOfData = () => {
  const [selectedDataType, setSelectedDataType] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showDecisionTree, setShowDecisionTree] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showOperationsTable, setShowOperationsTable] = useState(false);
  const [showDetailedExamples, setShowDetailedExamples] = useState(false);
  const [showMathNotation, setShowMathNotation] = useState(false);

  // Quiz questions for data classification
  const quizQuestions = [
    {
      question: "What type of data is 'Student's major: Computer Science'?",
      options: [
        "Categorical - Nominal",
        "Categorical - Ordinal",
        "Numerical - Discrete",
        "Numerical - Continuous"
      ],
      correctIndex: 0,
      explanation: "Student majors (Computer Science, Biology, etc.) are categories with no natural order, making them categorical-nominal data."
    },
    {
      question: "What type of data is 'Test score: 85.5%'?",
      options: [
        "Categorical - Nominal",
        "Categorical - Ordinal",
        "Numerical - Discrete",
        "Numerical - Continuous"
      ],
      correctIndex: 3,
      explanation: "Test scores can have decimal values and are measured on a continuous scale from 0 to 100%, making them numerical-continuous data."
    },
    {
      question: "What type of data is 'Survey response: Strongly Agree'?",
      options: [
        "Categorical - Nominal",
        "Categorical - Ordinal",
        "Numerical - Discrete",
        "Numerical - Continuous"
      ],
      correctIndex: 1,
      explanation: "Survey responses like 'Strongly Disagree' to 'Strongly Agree' have a natural order but the intervals between them aren't equal, making them categorical-ordinal data."
    },
    {
      question: "What type of data is 'Number of siblings: 3'?",
      options: [
        "Categorical - Nominal",
        "Categorical - Ordinal",
        "Numerical - Discrete",
        "Numerical - Continuous"
      ],
      correctIndex: 2,
      explanation: "You can only have whole numbers of siblings (0, 1, 2, 3...), not 2.5 siblings, making this numerical-discrete data."
    },
    {
      question: "What type of data is 'Eye color: Blue'?",
      options: [
        "Categorical - Nominal",
        "Categorical - Ordinal",
        "Numerical - Discrete",
        "Numerical - Continuous"
      ],
      correctIndex: 0,
      explanation: "Eye colors (Blue, Brown, Green, etc.) are categories with no inherent order - blue isn't 'greater than' brown - making them categorical-nominal data."
    },
    {
      question: "What type of data is 'Height: 172.4 cm'?",
      options: [
        "Categorical - Nominal",
        "Categorical - Ordinal",
        "Numerical - Discrete",
        "Numerical - Continuous"
      ],
      correctIndex: 3,
      explanation: "Height can be measured to any level of precision (172.4, 172.45, 172.456...) on a continuous scale, making it numerical-continuous data."
    },
    {
      question: "What type of data is 'Competition ranking: 1st place'?",
      options: [
        "Categorical - Nominal",
        "Categorical - Ordinal",
        "Numerical - Discrete",
        "Numerical - Continuous"
      ],
      correctIndex: 1,
      explanation: "Rankings (1st, 2nd, 3rd) have a clear order but the 'distance' between 1st and 2nd might not equal the distance between 2nd and 3rd, making them categorical-ordinal data."
    },
    {
      question: "What type of data is 'Number of students in class: 42'?",
      options: [
        "Categorical - Nominal",
        "Categorical - Ordinal",
        "Numerical - Discrete",
        "Numerical - Continuous"
      ],
      correctIndex: 2,
      explanation: "You can only have whole numbers of students (not 42.5 students), making this numerical-discrete data that you count rather than measure."
    }
  ];

  const dataTypes = {
    categorical: {
      title: "Categorical Data",
      icon: Tags,
      color: "from-blue-500 to-indigo-500",
      description: "Data that represents categories or groups",
      subtypes: [
        {
          name: "Nominal",
          description: "Categories with no natural order",
          examples: ["Major", "Eye Color", "Gender", "Blood Type"],
          operations: ["Mode", "Frequency counts"],
          cantDo: ["Mean", "Median", "Mathematical operations"]
        },
        {
          name: "Ordinal",
          description: "Categories with a natural order",
          examples: ["Education Level", "Satisfaction Rating", "Letter Grades", "Rankings"],
          operations: ["Mode", "Median", "Frequency counts"],
          cantDo: ["Mean (usually)", "Mathematical operations"]
        }
      ]
    },
    numerical: {
      title: "Numerical Data",
      icon: Hash,
      color: "from-violet-500 to-purple-500",
      description: "Data that represents quantities or measurements",
      subtypes: [
        {
          name: "Discrete",
          description: "Countable values, often whole numbers",
          examples: ["Number of Students", "Dice Rolls", "Number of Cars", "Quiz Score (out of 10)"],
          operations: ["Mean", "Median", "Mode", "All mathematical operations"],
          cantDo: ["Values between counts (can't have 2.5 students)"]
        },
        {
          name: "Continuous",
          description: "Measurable values on a continuous scale",
          examples: ["Height", "Weight", "Temperature", "Time", "GPA"],
          operations: ["Mean", "Median", "Mode", "All mathematical operations"],
          cantDo: ["Exact equality (always some measurement error)"]
        }
      ]
    }
  };

  const measurementScales = [
    {
      name: "Nominal",
      level: 1,
      properties: ["Classification only", "No ranking"],
      example: "Student ID numbers",
      color: "bg-gray-700"
    },
    {
      name: "Ordinal",
      level: 2,
      properties: ["Classification", "Ranking", "No equal intervals"],
      example: "Course difficulty (Easy, Medium, Hard)",
      color: "bg-blue-900/50"
    },
    {
      name: "Interval",
      level: 3,
      properties: ["Classification", "Ranking", "Equal intervals", "No true zero"],
      example: "Temperature in Celsius",
      color: "bg-violet-900/50"
    },
    {
      name: "Ratio",
      level: 4,
      properties: ["Classification", "Ranking", "Equal intervals", "True zero"],
      example: "Exam scores, Height, Weight",
      color: "bg-emerald-900/50"
    }
  ];


  return (
    <VisualizationContainer
      title="Types of Data"
      description="Understanding the foundation of choosing the right statistical methods"
    >
      <div className="space-y-6">
        {/* Introduction - Much more detailed */}
        <Card className="p-6 bg-gradient-to-r from-blue-900/20 to-violet-900/20 border-blue-600/30">
          <div className="flex items-start gap-4">
            <Database className="w-8 h-8 text-blue-400 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-blue-400 mb-3">Why Data Types Matter</h3>
              <p className="text-gray-300 mb-3">
                <strong>The fundamental principle:</strong> The type of data you have determines which statistical methods you can use. 
                You can't calculate the average of eye colors, but you can find the most common one!
              </p>
              <p className="text-gray-300 mb-3">
                Think of it like cooking - you wouldn't use a recipe for baking a cake to make a salad. Similarly, 
                different types of data require different statistical "recipes." Using the wrong method on your data 
                is like trying to find the "average" of red, blue, and green - it simply doesn't make sense!
              </p>
              <p className="text-gray-400 text-sm">
                <strong>Why this matters for you:</strong> Every time you collect data for a project, survey, or experiment, 
                the first question you must answer is "What type of data is this?" Your answer determines everything that 
                follows - which graphs you can create, which statistics you can calculate, and which conclusions you can draw.
              </p>
            </div>
          </div>
        </Card>

        {/* New: What is Data? - Basic Foundation */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            First, Let's Define "Data"
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <h4 className="font-medium text-yellow-400 mb-2">What exactly is data?</h4>
              <p className="text-sm text-gray-300 mb-3">
                Data is simply <strong>recorded information</strong>. Every time you write down an observation, 
                measurement, or fact, you're creating data. It could be:
              </p>
              <ul className="space-y-2 text-sm text-gray-400 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span><strong>Your height:</strong> 172 cm (a measurement)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span><strong>Your favorite color:</strong> Blue (a category)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span><strong>How happy you are:</strong> "Very happy" (an opinion)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span><strong>Number of pets:</strong> 2 (a count)</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-600/30">
              <h4 className="font-medium text-blue-400 mb-2">The Key Insight</h4>
              <p className="text-sm text-gray-300">
                Not all data is created equal! The number "172" (your height) and the word "Blue" (your favorite color) 
                are fundamentally different types of information. You can do math with 172 (find the average height 
                of a group), but you can't do math with "Blue" (what's the average of Blue and Red?). This difference 
                is what we mean by <strong>data types</strong>.
              </p>
            </div>
          </div>
        </Card>

        {/* Main Data Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(dataTypes).map(([key, type]) => {
            const Icon = type.icon;
            const isSelected = selectedDataType === key;
            
            return (
              <Card 
                key={key}
                className={`p-6 cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-blue-500 bg-gray-800/70' : 'bg-gray-800/50 hover:bg-gray-800/60'
                }`}
                onClick={() => setSelectedDataType(isSelected ? null : key)}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{type.title}</h3>
                    <p className="text-sm text-gray-400">{type.description}</p>
                  </div>
                </div>

                {/* Subtypes */}
                <div className="space-y-3">
                  {type.subtypes.map((subtype, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg bg-gray-900/50 ${
                        isSelected ? 'border border-gray-600' : ''
                      }`}
                    >
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Binary className="w-4 h-4 text-gray-500" />
                        {subtype.name}
                      </h4>
                      <p className="text-xs text-gray-400 mb-2">{subtype.description}</p>
                      
                      {isSelected && (
                        <div className="space-y-2 mt-3">
                          <div>
                            <p className="text-xs font-semibold text-emerald-400 mb-1">Examples:</p>
                            <div className="flex flex-wrap gap-1">
                              {subtype.examples.map((ex, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-emerald-900/30 rounded">
                                  {ex}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs font-semibold text-blue-400 mb-1">Can Do:</p>
                            <div className="flex flex-wrap gap-1">
                              {subtype.operations.map((op, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-blue-900/30 rounded">
                                  {op}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs font-semibold text-red-400 mb-1">Can't Do:</p>
                            <div className="flex flex-wrap gap-1">
                              {subtype.cantDo.map((op, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-red-900/30 rounded">
                                  {op}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* New: Mathematical Notation for Data Types */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-400" />
            Mathematical Notation for Data Types
          </h3>
          
          <Button
            onClick={() => setShowMathNotation(!showMathNotation)}
            variant="outline"
            className="mb-4"
          >
            {showMathNotation ? "Hide" : "Show"} Mathematical Definitions
          </Button>
          
          {showMathNotation && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-900/20 rounded-lg">
                <h4 className="font-medium text-purple-400 mb-2">Formal Definitions</h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-gray-900/50 rounded">
                    <p className="font-mono text-purple-300 mb-1">Categorical (Nominal):</p>
                    <p className="text-gray-400">X ∈ {"{"} category₁, category₂, ..., categoryₙ {"}"}</p>
                    <p className="text-xs text-gray-500 mt-1">Finite set with no ordering</p>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded">
                    <p className="font-mono text-blue-300 mb-1">Categorical (Ordinal):</p>
                    <p className="text-gray-400">X ∈ {"{"} c₁, c₂, ..., cₙ {"}"} where c₁ {"<"} c₂ {"<"} ... {"<"} cₙ</p>
                    <p className="text-xs text-gray-500 mt-1">Ordered categories, intervals not defined</p>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded">
                    <p className="font-mono text-violet-300 mb-1">Numerical (Discrete):</p>
                    <p className="text-gray-400">X ∈ ℤ or countable subset of ℝ</p>
                    <p className="text-xs text-gray-500 mt-1">Countable values, often integers</p>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded">
                    <p className="font-mono text-emerald-300 mb-1">Numerical (Continuous):</p>
                    <p className="text-gray-400">X ∈ ℝ or interval [a, b] ⊂ ℝ</p>
                    <p className="text-xs text-gray-500 mt-1">Uncountable, any value in range</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
        
        {/* New: Operations by Data Type Table */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Table className="w-5 h-5 text-cyan-400" />
            Valid Operations by Data Type
          </h3>
          
          <Button
            onClick={() => setShowOperationsTable(!showOperationsTable)}
            variant="outline"
            className="mb-4"
          >
            {showOperationsTable ? "Hide" : "Show"} Operations Table
          </Button>
          
          {showOperationsTable && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 text-cyan-400">Data Type</th>
                    <th className="text-left p-3 text-green-400">Valid Operations</th>
                    <th className="text-left p-3 text-red-400">Invalid Operations</th>
                    <th className="text-left p-3 text-gray-400">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 font-medium">Nominal</td>
                    <td className="p-3 text-green-300 text-xs">=, ≠, mode, frequency, %</td>
                    <td className="p-3 text-red-300 text-xs">{"<"}, {">"}, mean, median, SD</td>
                    <td className="p-3 text-gray-400 text-xs">Eye color, Gender</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 font-medium">Ordinal</td>
                    <td className="p-3 text-green-300 text-xs">=, ≠, {"<"}, {">"}, median, mode, percentiles</td>
                    <td className="p-3 text-red-300 text-xs">mean*, SD*, arithmetic</td>
                    <td className="p-3 text-gray-400 text-xs">Letter grades, Rankings</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 font-medium">Interval</td>
                    <td className="p-3 text-green-300 text-xs">+, -, mean, SD, all comparisons</td>
                    <td className="p-3 text-red-300 text-xs">×, ÷, ratios, CV</td>
                    <td className="p-3 text-gray-400 text-xs">Temperature (°C), Dates</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 font-medium">Ratio</td>
                    <td className="p-3 text-green-300 text-xs">All arithmetic operations, all statistics</td>
                    <td className="p-3 text-red-300 text-xs">None</td>
                    <td className="p-3 text-gray-400 text-xs">Height, Weight, Money</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-3">
                * Sometimes used in practice but technically incorrect
              </p>
            </div>
          )}
        </Card>
        
        {/* New: 15 Comprehensive Classification Examples */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-400" />
            15 Detailed Classification Examples
          </h3>
          
          <Button
            onClick={() => setShowDetailedExamples(!showDetailedExamples)}
            variant="outline"
            className="mb-4"
          >
            {showDetailedExamples ? "Hide" : "Show"} Detailed Examples
          </Button>
          
          {showDetailedExamples && (
            <div className="space-y-3">
              {[
                {
                  data: "Temperature: 98.6°F",
                  type: "Continuous",
                  scale: "Interval (Fahrenheit) or Ratio (Kelvin)",
                  explanation: "Fahrenheit has arbitrary zero (interval), Kelvin has absolute zero (ratio)"
                },
                {
                  data: "Survey: Rate 1-10",
                  type: "Ordinal (technically)",
                  scale: "Often treated as Interval",
                  explanation: "The gap between 7→8 may differ from 8→9, but often analyzed as interval"
                },
                {
                  data: "Time of day: 3:45 PM",
                  type: "Interval",
                  scale: "Interval",
                  explanation: "Midnight is arbitrary zero, can't say '6PM is twice 3PM'"
                },
                {
                  data: "Duration: 45 minutes",
                  type: "Continuous",
                  scale: "Ratio",
                  explanation: "True zero exists (0 minutes), 90 min IS twice 45 min"
                },
                {
                  data: "Student ID: 2024001",
                  type: "Nominal",
                  scale: "Nominal",
                  explanation: "Numbers used as labels only, 2024002 isn't 'greater than' 2024001"
                },
                {
                  data: "Stock price: $156.78",
                  type: "Continuous",
                  scale: "Ratio",
                  explanation: "True zero ($0), all arithmetic valid, $200 IS twice $100"
                },
                {
                  data: "Pain level: Moderate",
                  type: "Ordinal",
                  scale: "Ordinal",
                  explanation: "Clear order (Mild {"<"} Moderate {"<"} Severe) but intervals undefined"
                },
                {
                  data: "Shoe size: 10.5",
                  type: "Discrete (practically)",
                  scale: "Interval",
                  explanation: "Limited values (no size 10.73), size 0 is arbitrary, not 'no shoe'"
                },
                {
                  data: "pH level: 7.4",
                  type: "Continuous",
                  scale: "Interval",
                  explanation: "Logarithmic scale, pH 4 isn't 'half' of pH 8"
                },
                {
                  data: "Number of children: 3",
                  type: "Discrete",
                  scale: "Ratio",
                  explanation: "Must be whole number, true zero (no children), 6 IS twice 3"
                },
                {
                  data: "Zip code: 90210",
                  type: "Nominal",
                  scale: "Nominal",
                  explanation: "Pure category label, 90211 isn't 'next to' 90210 numerically"
                },
                {
                  data: "IQ score: 115",
                  type: "Continuous (theoretically)",
                  scale: "Interval",
                  explanation: "100 is arbitrary average, IQ 200 isn't 'twice as smart' as 100"
                },
                {
                  data: "Movie rating: 4.5 stars",
                  type: "Ordinal (displayed as discrete)",
                  scale: "Ordinal/Interval hybrid",
                  explanation: "Ordinal categories but often averaged, creating pseudo-interval"
                },
                {
                  data: "Blood type: A+",
                  type: "Nominal",
                  scale: "Nominal",
                  explanation: "Pure categories, no order (A isn't 'less than' B)"
                },
                {
                  data: "Age: 21.5 years",
                  type: "Continuous",
                  scale: "Ratio",
                  explanation: "True zero (birth), 40 years IS twice 20 years"
                }
              ].map((example, idx) => (
                <div key={idx} className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-orange-300">Example {idx + 1}: {example.data}</h4>
                    <span className="text-xs px-2 py-1 bg-orange-900/30 rounded">
                      {example.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400">
                        <strong className="text-cyan-300">Measurement Scale:</strong> {example.scale}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">
                        <strong className="text-emerald-300">Why:</strong> {example.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        
        {/* New: Step-by-Step Decision Guide */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Binary className="w-5 h-5 text-purple-400" />
            Step-by-Step: How to Identify Your Data Type
          </h3>
          
          <Button 
            onClick={() => setShowDecisionTree(!showDecisionTree)}
            variant="outline"
            className="mb-4"
          >
            {showDecisionTree ? "Hide" : "Show"} Decision Tree
          </Button>
          
          {showDecisionTree && (
            <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg">
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-purple-400 mb-2">Step 1: Can you do meaningful arithmetic with it?</h4>
                <p className="text-sm text-gray-300 mb-2">
                  Ask yourself: Does adding, subtracting, or averaging make sense?
                </p>
                <div className="ml-4 space-y-2">
                  <div className="p-3 bg-green-900/20 rounded">
                    <p className="text-sm"><strong className="text-green-400">YES:</strong> "Test scores: 85 + 92 = 177" ✓ Makes sense!</p>
                    <p className="text-xs text-gray-400 mt-1">→ This is NUMERICAL data. Continue to Step 2.</p>
                  </div>
                  <div className="p-3 bg-red-900/20 rounded">
                    <p className="text-sm"><strong className="text-red-400">NO:</strong> "Eye colors: Blue + Green = ??" ✗ Nonsense!</p>
                    <p className="text-xs text-gray-400 mt-1">→ This is CATEGORICAL data. Skip to Step 3.</p>
                  </div>
                </div>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-blue-400 mb-2">Step 2 (For Numerical): Can you have fractions/decimals?</h4>
                <p className="text-sm text-gray-300 mb-2">
                  Is it something you count (whole numbers) or measure (can have decimals)?
                </p>
                <div className="ml-4 space-y-2">
                  <div className="p-3 bg-blue-900/20 rounded">
                    <p className="text-sm"><strong className="text-blue-400">Can have decimals:</strong> Height = 172.5 cm, Time = 3.14 seconds</p>
                    <p className="text-xs text-gray-400 mt-1">→ CONTINUOUS (measured)</p>
                  </div>
                  <div className="p-3 bg-violet-900/20 rounded">
                    <p className="text-sm"><strong className="text-violet-400">Only whole numbers:</strong> Number of students = 25, Dice roll = 4</p>
                    <p className="text-xs text-gray-400 mt-1">→ DISCRETE (counted)</p>
                  </div>
                </div>
              </div>
              
              <div className="border-l-4 border-emerald-500 pl-4">
                <h4 className="font-medium text-emerald-400 mb-2">Step 3 (For Categorical): Is there a natural order?</h4>
                <p className="text-sm text-gray-300 mb-2">
                  Can you rank or order the categories from least to greatest?
                </p>
                <div className="ml-4 space-y-2">
                  <div className="p-3 bg-emerald-900/20 rounded">
                    <p className="text-sm"><strong className="text-emerald-400">Has order:</strong> Small {"<"} Medium {"<"} Large, Disagree {"<"} Neutral {"<"} Agree</p>
                    <p className="text-xs text-gray-400 mt-1">→ ORDINAL (ordered categories)</p>
                  </div>
                  <div className="p-3 bg-orange-900/20 rounded">
                    <p className="text-sm"><strong className="text-orange-400">No order:</strong> Red vs Blue, Math vs English, Male vs Female</p>
                    <p className="text-xs text-gray-400 mt-1">→ NOMINAL (named categories)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Measurement Scales - Enhanced */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Levels of Measurement (Stevens' Typology)
          </h3>
          <p className="text-sm text-gray-400 mb-2">
            Another way to classify data is by measurement scale. Each level includes all the properties of lower levels.
          </p>
          <p className="text-sm text-gray-300 mb-4">
            <strong>Why this matters:</strong> The level of measurement determines which mathematical operations are valid. 
            Using the wrong operation (like finding the mean of nominal data) produces meaningless results!
          </p>
          
          <div className="space-y-3">
            {measurementScales.map((scale, idx) => (
              <div key={idx} className={`p-4 rounded-lg ${scale.color} border border-gray-700`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium mb-1 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-800 rounded">Level {scale.level}</span>
                      {scale.name}
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">Example: {scale.example}</p>
                    <div className="flex flex-wrap gap-2">
                      {scale.properties.map((prop, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-gray-900/50 rounded">
                          {prop}
                        </span>
                      ))}
                    </div>
                  </div>
                  {idx > 0 && (
                    <ArrowRight className="w-4 h-4 text-gray-600 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Interactive Quiz - Using Gold Standard QuizBreak Component */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            Test Your Understanding
          </h3>
          
          <p className="text-gray-300 mb-6">
            Can you classify different types of data correctly? Test your knowledge with these 8 questions.
          </p>
          
          <QuizBreak
            questions={quizQuestions}
            onComplete={() => setQuizCompleted(true)}
          />
          
          {quizCompleted && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
              <p className="text-sm text-green-300">
                <strong className="text-green-400">Excellent work!</strong> You've completed the data types quiz. 
                Understanding these classifications is fundamental to choosing the right statistical methods. 
                Remember: Always identify your data type first before selecting any statistical technique!
              </p>
            </div>
          )}
        </Card>

        {/* New: Real-World Scenarios */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Practice Scenarios: Classify These Real Data
          </h3>
          
          <div className="space-y-3">
            <Button
              onClick={() => setExpandedSection(expandedSection === 'scenarios' ? null : 'scenarios')}
              variant="outline"
              className="w-full justify-between"
            >
              <span>Try These 10 Real-World Examples</span>
              <ArrowRight className={`w-4 h-4 transition-transform ${expandedSection === 'scenarios' ? 'rotate-90' : ''}`} />
            </Button>
            
            {expandedSection === 'scenarios' && (
              <div className="space-y-2 p-4 bg-gray-900/50 rounded-lg">
                {[
                  { data: "Instagram followers: 1,234", answer: "Numerical-Discrete (counting whole people)" },
                  { data: "Coffee temperature: 165.3°F", answer: "Numerical-Continuous (measured precisely)" },
                  { data: "T-shirt size: Medium", answer: "Categorical-Ordinal (S < M < L < XL)" },
                  { data: "ZIP code: 90210", answer: "Categorical-Nominal (numbers used as labels, not for math)" },
                  { data: "Movie rating: 4.5 stars", answer: "Categorical-Ordinal (ordered rating scale; intervals not guaranteed equal)" },
                  { data: "Political party: Democrat", answer: "Categorical-Nominal (no inherent order)" },
                  { data: "Pain level: 7/10", answer: "Categorical-Ordinal (ordered but intervals not equal)" },
                  { data: "Bank balance: $1,523.47", answer: "Numerical-Continuous (can have any decimal value)" },
                  { data: "Semester: Fall 2024", answer: "Categorical-Nominal (time label, not numeric)" },
                  { data: "WiFi signal: Excellent", answer: "Categorical-Ordinal (Poor < Fair < Good < Excellent)" }
                ].map((scenario, idx) => (
                  <div key={idx} className="p-3 bg-gray-800/50 rounded">
                    <p className="text-sm font-medium text-gray-300">{idx + 1}. {scenario.data}</p>
                    <p className="text-xs text-gray-500 mt-1">Answer: {scenario.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Common Mistakes - Much More Detailed */}
        <Card className="p-6 bg-red-900/20 border-red-600/30">
          <h3 className="text-lg font-semibold mb-4 text-red-400">Common Mistakes to Avoid (With Examples)</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <X className="w-4 h-4 text-red-400 mt-0.5" />
                <strong className="text-red-300">Mistake #1: Treating ordinal as interval/ratio</strong>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                Letter grades (A, B, C, D, F) have order, but the "distance" between grades isn't equal.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-red-900/10 rounded">
                  <p className="text-red-400">❌ Wrong:</p>
                  <p className="text-gray-400">"The average grade is B" (How do you average letters?)</p>
                  <p className="text-gray-400">"A is twice as good as C" (Says who?)</p>
                </div>
                <div className="p-2 bg-green-900/10 rounded">
                  <p className="text-green-400">✓ Right:</p>
                  <p className="text-gray-400">"Most students got a B" (mode)</p>
                  <p className="text-gray-400">"The median grade was B" (middle value)</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <X className="w-4 h-4 text-red-400 mt-0.5" />
                <strong className="text-red-300">Mistake #2: Confusing discrete and continuous</strong>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                Some data looks continuous but is actually discrete (or vice versa).
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-yellow-900/10 rounded">
                  <p className="text-yellow-400">Money Example:</p>
                  <p className="text-gray-400">• Technically discrete (can't have $1.234567...)</p>
                  <p className="text-gray-400">• Usually treated as continuous in statistics</p>
                  <p className="text-gray-400">• Why? The gaps (1 cent) are so small they're negligible</p>
                </div>
                <div className="p-2 bg-blue-900/10 rounded">
                  <p className="text-blue-400">Age Example:</p>
                  <p className="text-gray-400">• Can be discrete: "How old are you?" → "21 years"</p>
                  <p className="text-gray-400">• Can be continuous: "Exact age?" → "21.73 years"</p>
                  <p className="text-gray-400">• Depends on how precisely you measure!</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <X className="w-4 h-4 text-red-400 mt-0.5" />
                <strong className="text-red-300">Mistake #3: Using numbers as quantities when they're actually labels</strong>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                Just because something is a number doesn't mean it's numerical data!
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-red-900/10 rounded">
                  <p className="text-red-400">❌ These are NOT numerical (they're nominal):</p>
                  <p className="text-gray-400">• ZIP codes (90210 isn't "bigger" than 10001)</p>
                  <p className="text-gray-400">• Phone numbers (can't average them)</p>
                  <p className="text-gray-400">• Student ID numbers (just identifiers)</p>
                  <p className="text-gray-400">• Jersey numbers (LeBron's 23 isn't "less than" Curry's 30)</p>
                </div>
                <div className="p-2 bg-orange-900/10 rounded">
                  <p className="text-orange-400">⚠️ The Test:</p>
                  <p className="text-gray-400">Ask: "Does arithmetic make sense?" If no, it's categorical!</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <X className="w-4 h-4 text-red-400 mt-0.5" />
                <strong className="text-red-300">Mistake #4: Misunderstanding Likert scales</strong>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                Survey scales (1-5, Strongly Disagree to Strongly Agree) are tricky!
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-violet-900/10 rounded">
                  <p className="text-violet-400">The Debate:</p>
                  <p className="text-gray-400">• Technically ordinal (ordered categories)</p>
                  <p className="text-gray-400">• Often treated as interval in research</p>
                  <p className="text-gray-400">• Why? Easier analysis, usually "close enough"</p>
                  <p className="text-gray-400">• But be careful with interpretations!</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Takeaway */}
        <div className="p-4 bg-emerald-900/20 border border-emerald-600/30 rounded-lg">
          <p className="text-sm text-emerald-300">
            <strong className="text-emerald-400">Remember:</strong> Always identify your data type first! 
            It determines which graphs you can create, which statistics you can calculate, and which 
            statistical tests you can perform. This is the foundation of all statistical analysis.
          </p>
        </div>
      </div>
    </VisualizationContainer>
  );
};

export default TypesOfData;
