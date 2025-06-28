'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator, Target, FlaskConical, BarChart3, Info, TrendingUp, Lightbulb, Gauge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfidenceIntervalsHub = () => {
  const [selectedLevel, setSelectedLevel] = useState(95);
  const [animatedMargin, setAnimatedMargin] = useState(0);

  // Animate margin of error based on confidence level
  useEffect(() => {
    const zValues = { 90: 1.645, 95: 1.96, 99: 2.576 };
    const margin = (zValues[selectedLevel] * 10) / Math.sqrt(100); // Example calculation
    setAnimatedMargin(margin);
  }, [selectedLevel]);

  const learningPaths = [
    {
      id: 1,
      title: "Confidence Interval Builder",
      component: "5-2-1-ConfidenceIntervalBuilder",
      description: "Build your first confidence interval step by step",
      icon: Calculator,
      color: "from-blue-400 to-blue-500",
      borderColor: "border-blue-300",
      level: "Foundation",
      topics: ["Margin of Error", "Sample Mean", "Z-scores"]
    },
    {
      id: 2,
      title: "Confidence Interval Masterclass",
      component: "5-2-2-ConfidenceIntervalMasterclass",
      description: "Master the art of interval estimation",
      icon: Target,
      color: "from-blue-500 to-blue-600",
      borderColor: "border-blue-400",
      level: "Advanced",
      topics: ["Interpretation", "Sample Size", "Precision"]
    },
    {
      id: 3,
      title: "Critical Values Explorer",
      component: "5-2-3-CriticalValuesExplorer",
      description: "Discover how critical values shape confidence",
      icon: FlaskConical,
      color: "from-cyan-400 to-cyan-500",
      borderColor: "border-cyan-300",
      level: "Deep Dive",
      topics: ["Z-table", "Alpha Levels", "Two-tailed Tests"]
    },
    {
      id: 4,
      title: "Confidence Interval Simulation",
      component: "5-2-4-ConfidenceIntervalSimulation",
      description: "See confidence intervals in action through simulation",
      icon: BarChart3,
      color: "from-cyan-500 to-cyan-600",
      borderColor: "border-cyan-400",
      level: "Interactive",
      topics: ["Coverage", "Repeated Sampling", "True Parameter"]
    }
  ];

  const confidenceLevels = [
    { level: 90, zScore: 1.645, color: "bg-blue-400", description: "Good for exploratory analysis" },
    { level: 95, zScore: 1.96, color: "bg-blue-500", description: "Standard for most research" },
    { level: 99, zScore: 2.576, color: "bg-blue-600", description: "High precision applications" }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Confidence Intervals (Known σ)
          </h1>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            Master the art of interval estimation when population variance is known
          </p>
          <div className="mt-2 text-lg font-medium text-blue-400">
            Theme: "Precision with Certainty"
          </div>
        </motion.div>

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 mb-12 text-white shadow-xl border border-blue-500/30"
        >
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">Welcome to Confidence Intervals</h2>
              <p className="text-neutral-300 text-lg mb-4">
                When we know the population standard deviation (σ), we can construct precise confidence intervals 
                using the normal distribution. This powerful technique allows us to estimate population parameters 
                with a specified level of confidence.
              </p>
              <div className="bg-neutral-800/50 backdrop-blur-sm rounded-lg p-4 mt-4 border border-blue-500/30">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  The Confidence Interval Formula
                </h3>
                <div className="font-mono text-center py-2 bg-neutral-900/50 rounded">
                  CI = x̄ ± z*(σ/√n)
                </div>
                <p className="text-sm mt-2 text-neutral-400">
                  Where x̄ is sample mean, z* is critical value, σ is population SD, n is sample size
                </p>
              </div>
            </div>
            <div className="hidden lg:block">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="bg-blue-900/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30"
              >
                <Target className="w-24 h-24 text-blue-400" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Interactive Confidence Level Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-neutral-800 rounded-2xl shadow-lg p-8 mb-12 border border-neutral-700"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            Visual Understanding of Confidence Levels
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Confidence Level Selector */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Select Confidence Level</h3>
              <div className="space-y-4">
                {confidenceLevels.map(({ level, zScore, color, description }) => (
                  <motion.button
                    key={level}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedLevel(level)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedLevel === level 
                        ? 'border-blue-500 bg-blue-900/20' 
                        : 'border-neutral-600 hover:border-blue-400 bg-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="font-semibold text-lg text-white">{level}% Confidence</div>
                        <div className="text-sm text-neutral-400">{description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-neutral-400">z* = {zScore}</div>
                        <div className={`w-16 h-2 ${color} rounded-full mt-1`} />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Right: Margin of Error Visualization */}
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border border-blue-500/30">
              <h3 className="text-lg font-semibold mb-4 text-white">Margin of Error Impact</h3>
              <div className="relative h-40 mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ width: `${(animatedMargin / 5) * 100}%` }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full relative"
                  >
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full" />
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-500 rounded-full" />
                  </motion.div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  ±{animatedMargin.toFixed(2)}
                </div>
                <div className="text-sm text-neutral-400 mt-1">
                  Margin of Error (σ = 10, n = 100)
                </div>
              </div>
              <div className="mt-4 text-sm text-neutral-300 bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
                Higher confidence → Wider interval → Less precision but more certainty
              </div>
            </div>
          </div>
        </motion.div>

        {/* Learning Path Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {learningPaths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link href={`/chapter5/confidence-intervals-known/${path.component.replace('5-2-', '')}`}>
                <div className={`group relative h-full bg-gradient-to-br ${path.color} p-[2px] rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
                  <div className="bg-neutral-800 rounded-xl p-6 h-full border border-neutral-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${path.color} shadow-lg`}>
                        <path.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        path.level === 'Foundation' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                        path.level === 'Advanced' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
                        path.level === 'Deep Dive' ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' :
                        'bg-orange-900/30 text-orange-400 border border-orange-500/30'
                      }`}>
                        {path.level}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {path.title}
                    </h3>
                    <p className="text-neutral-400 mb-4">
                      {path.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {path.topics.map((topic, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full border border-blue-500/30">
                          {topic}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center text-blue-400 font-medium group-hover:gap-3 transition-all">
                      <span>Start Learning</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Real-World Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 mb-12 border border-blue-500/30"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Real-World Applications</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-neutral-800 rounded-lg p-4 shadow-md border border-neutral-700">
              <h3 className="font-semibold text-blue-400 mb-2">Quality Control</h3>
              <p className="text-sm text-neutral-400">
                Manufacturing uses CI to ensure product dimensions stay within specifications
              </p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4 shadow-md border border-neutral-700">
              <h3 className="font-semibold text-blue-400 mb-2">Medical Testing</h3>
              <p className="text-sm text-neutral-400">
                Lab results report normal ranges as confidence intervals for accuracy
              </p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4 shadow-md border border-neutral-700">
              <h3 className="font-semibold text-blue-400 mb-2">Financial Analysis</h3>
              <p className="text-sm text-neutral-400">
                Investment returns are often expressed with confidence intervals
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pro Tip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-2 border-yellow-500/30 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">Pro Tip: Interpreting Confidence Intervals</h3>
              <p className="text-neutral-300">
                A 95% confidence interval does NOT mean there's a 95% probability the true parameter is in the interval. 
                Instead, it means that if we repeated our sampling process many times, 95% of the intervals we construct 
                would contain the true parameter. It's about the reliability of our method, not the probability of a 
                single interval!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfidenceIntervalsHub;