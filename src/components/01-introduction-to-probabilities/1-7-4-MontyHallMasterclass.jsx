"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer
} from '../ui/VisualizationContainer';
import { colors, typography, components, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { ProgressBar } from '../ui/ProgressBar';
import { 
  Brain, 
  ChevronRight, 
  ChevronLeft,
  Trophy, 
  Users, 
  Sparkles, 
  Lock,
  CheckCircle,
  Clock,
  MessageSquare,
  Share2,
  Star
} from 'lucide-react';
import MontyHallInteractive from './1-7-1-MontyHallInteractive';
import MontyHallBayesian from './1-7-2-MontyHallBayesian';
import MontyHallSimulation from './1-7-3-MontyHallSimulation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Color scheme
const colorScheme = createColorScheme('masterclass');

// Stage definitions
const STAGES = [
  {
    id: 'intro',
    title: 'The Paradox',
    subtitle: 'Welcome to the most counterintuitive problem in probability',
    icon: Brain,
    color: 'blue',
    unlocked: true
  },
  {
    id: 'interactive',
    title: 'Play & Discover',
    subtitle: 'Experience the problem firsthand',
    icon: Sparkles,
    color: 'purple',
    requiredGames: 10
  },
  {
    id: 'bayesian',
    title: 'Mathematical Proof',
    subtitle: 'Understand why switching works',
    icon: Brain,
    color: 'emerald',
    requiredGames: 20
  },
  {
    id: 'simulation',
    title: 'Law of Large Numbers',
    subtitle: 'See the truth emerge at scale',
    icon: Trophy,
    color: 'amber',
    requiredGames: 30
  }
];

// Milestone messages
const MILESTONES = {
  5: { message: "Great start! You're beginning to see a pattern...", type: 'info' },
  10: { message: "Stage 2 Unlocked! Time to dive deeper!", type: 'unlock' },
  15: { message: "You're catching on! The pattern is becoming clearer.", type: 'progress' },
  20: { message: "Stage 3 Unlocked! Ready for the mathematical proof?", type: 'unlock' },
  25: { message: "Almost there! Your intuition is transforming.", type: 'progress' },
  30: { message: "🎉 All Stages Unlocked! You've mastered the Monty Hall problem!", type: 'complete' }
};

// Floating probability component
const FloatingProbability = ({ value, x, y, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 0], y: -50, scale: 1 }}
      transition={{ duration: 2 }}
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
    >
      <div className={cn(
        "px-3 py-1 rounded-full font-mono font-bold text-sm",
        color === 'green' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
      )}>
        {value}%
      </div>
    </motion.div>
  );
};

// Progress tracker component
const ProgressTracker = ({ currentStage, totalGames, onStageSelect }) => {
  return (
    <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
      <h4 className="text-sm font-bold text-white mb-3">Your Learning Journey</h4>
      <div className="space-y-3">
        {STAGES.map((stage, index) => {
          const isUnlocked = stage.unlocked || (stage.requiredGames && totalGames >= stage.requiredGames);
          const isActive = currentStage === stage.id;
          const isCompleted = index < STAGES.findIndex(s => s.id === currentStage);
          
          return (
            <button
              key={stage.id}
              onClick={() => isUnlocked && onStageSelect(stage.id)}
              disabled={!isUnlocked}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all",
                isActive && "bg-blue-600/20 border border-blue-600/50",
                !isActive && isUnlocked && "bg-neutral-800 hover:bg-neutral-700 border border-neutral-600",
                !isUnlocked && "bg-neutral-800/50 opacity-50 cursor-not-allowed border border-neutral-700"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isActive && "bg-blue-600",
                  isCompleted && "bg-green-600",
                  !isActive && !isCompleted && isUnlocked && "bg-neutral-700",
                  !isUnlocked && "bg-neutral-800"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : isUnlocked ? (
                    <stage.icon className="w-5 h-5 text-white" />
                  ) : (
                    <Lock className="w-5 h-5 text-neutral-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "font-semibold",
                    isActive ? "text-white" : "text-neutral-300"
                  )}>
                    {stage.title}
                  </p>
                  <p className="text-xs text-neutral-400">{stage.subtitle}</p>
                  {!isUnlocked && stage.requiredGames && (
                    <p className="text-xs text-amber-400 mt-1">
                      Unlocks at {stage.requiredGames} games ({stage.requiredGames - totalGames} more)
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Social features component
const SocialFeatures = ({ totalGames, switchRate }) => {
  const [showShare, setShowShare] = useState(false);
  const [classAverage] = useState({ games: 156, switchRate: 0.64 }); // Mock data
  
  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-600/30">
      <h4 className="text-sm font-bold text-purple-300 mb-3">Community Insights</h4>
      
      <div className="space-y-3">
        {/* Class comparison */}
        <div className="bg-neutral-900/50 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-300 font-medium">Class Average</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-neutral-400">Games played: </span>
              <span className="font-mono text-purple-300">{classAverage.games}</span>
            </div>
            <div>
              <span className="text-neutral-400">Switch rate: </span>
              <span className="font-mono text-purple-300">{(classAverage.switchRate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        {/* Share achievement */}
        {totalGames >= 30 && (
          <div className="text-center">
            <Button
              onClick={() => setShowShare(!showShare)}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Your Achievement
            </Button>
            
            {showShare && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-neutral-800 rounded text-xs text-neutral-300"
              >
                "I just mastered the Monty Hall problem! After {totalGames} games, 
                I learned that switching wins {(switchRate * 100).toFixed(1)}% of the time! 🎉"
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Masterclass Component
function MontyHallMasterclass() {
  const [currentStage, setCurrentStage] = useState('intro');
  const [totalGames, setTotalGames] = useState(0);
  const [userProgress, setUserProgress] = useState({
    gamesPlayed: 0,
    switchWins: 0,
    stayWins: 0,
    milestones: [],
    startTime: Date.now()
  });
  const [showMilestone, setShowMilestone] = useState(null);
  const [floatingProbs, setFloatingProbs] = useState([]);
  
  const containerRef = useRef(null);
  const progressRef = useRef(userProgress);
  
  // Update progress ref
  useEffect(() => {
    progressRef.current = userProgress;
  }, [userProgress]);
  
  // Handle game completion from interactive component
  const handleGameComplete = useCallback((result) => {
    const newProgress = { ...progressRef.current };
    newProgress.gamesPlayed++;
    
    if (result.strategy === 'switch' && result.won) {
      newProgress.switchWins++;
    } else if (result.strategy === 'stay' && result.won) {
      newProgress.stayWins++;
    }
    
    setUserProgress(newProgress);
    setTotalGames(newProgress.gamesPlayed);
    
    // Check for milestones
    const milestone = MILESTONES[newProgress.gamesPlayed];
    if (milestone && !newProgress.milestones.includes(newProgress.gamesPlayed)) {
      newProgress.milestones.push(newProgress.gamesPlayed);
      setShowMilestone(milestone);
      
      if (milestone.type === 'complete') {
        // Trigger confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
        });
      }
      
      setTimeout(() => setShowMilestone(null), 5000);
    }
    
    // Add floating probability animation
    if (Math.random() < 0.3) { // 30% chance
      const prob = result.strategy === 'switch' ? 66.7 : 33.3;
      const color = result.won ? 'green' : 'red';
      const id = Date.now();
      
      setFloatingProbs(prev => [...prev, {
        id,
        value: prob,
        x: Math.random() * 80 + 10 + '%',
        y: Math.random() * 50 + 25 + '%',
        color
      }]);
      
      setTimeout(() => {
        setFloatingProbs(prev => prev.filter(p => p.id !== id));
      }, 2000);
    }
  }, []);
  
  // Calculate statistics
  const switchRate = userProgress.gamesPlayed > 0 
    ? userProgress.switchWins / Math.max(1, userProgress.switchWins + userProgress.stayWins)
    : 0;
    
  const timeSpent = Math.floor((Date.now() - userProgress.startTime) / 1000 / 60); // minutes
  
  return (
    <VisualizationContainer
      title={currentStage === 'intro' ? "Monty Hall Problem: Complete Masterclass" : ""}
      description={
        currentStage === 'intro' ? (
          <p className={typography.description}>
            Journey through the most famous probability paradox. Start with hands-on play, 
            discover the mathematical proof, and witness the truth emerge through simulation.
          </p>
        ) : null
      }
      ref={containerRef}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Progress and Social */}
        <div className="lg:w-1/4 space-y-4">
          {/* Progress Tracker */}
          <ProgressTracker 
            currentStage={currentStage}
            totalGames={totalGames}
            onStageSelect={setCurrentStage}
          />
          
          {/* Statistics */}
          <VisualizationSection className="p-4">
            <h4 className="text-sm font-bold text-white mb-3">Your Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Games Played</span>
                <span className="font-mono text-white">{userProgress.gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Time Spent</span>
                <span className="font-mono text-white">{timeSpent} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Switch Success</span>
                <span className="font-mono text-emerald-400">
                  {userProgress.switchWins > 0 ? `${(switchRate * 100).toFixed(1)}%` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Milestones</span>
                <span className="font-mono text-amber-400">{userProgress.milestones.length}/6</span>
              </div>
            </div>
          </VisualizationSection>
          
          {/* Social Features */}
          <SocialFeatures 
            totalGames={totalGames}
            switchRate={switchRate}
          />
        </div>
        
        {/* Main Content Area */}
        <div className="lg:w-3/4 relative">
          {/* Floating probabilities */}
          <AnimatePresence>
            {floatingProbs.map(prob => (
              <FloatingProbability key={prob.id} {...prob} />
            ))}
          </AnimatePresence>
          
          {/* Milestone notification */}
          <AnimatePresence>
            {showMilestone && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className={cn(
                  "absolute top-4 left-1/2 -translate-x-1/2 z-50",
                  "px-6 py-3 rounded-lg shadow-lg",
                  showMilestone.type === 'unlock' && "bg-blue-600",
                  showMilestone.type === 'progress' && "bg-purple-600",
                  showMilestone.type === 'complete' && "bg-green-600"
                )}
              >
                <div className="flex items-center gap-3">
                  {showMilestone.type === 'complete' ? (
                    <Trophy className="w-6 h-6 text-white" />
                  ) : (
                    <Star className="w-6 h-6 text-white" />
                  )}
                  <p className="text-white font-semibold">{showMilestone.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Stage Content */}
          <AnimatePresence mode="wait">
            {currentStage === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <IntroStage onComplete={() => setCurrentStage('interactive')} />
              </motion.div>
            )}
            
            {currentStage === 'interactive' && (
              <motion.div
                key="interactive"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <InteractiveStageWrapper 
                  onGameComplete={handleGameComplete}
                  totalGames={totalGames}
                />
              </motion.div>
            )}
            
            {currentStage === 'bayesian' && (
              <motion.div
                key="bayesian"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MontyHallBayesian />
              </motion.div>
            )}
            
            {currentStage === 'simulation' && (
              <motion.div
                key="simulation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MontyHallSimulation />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <Button
              onClick={() => {
                const currentIndex = STAGES.findIndex(s => s.id === currentStage);
                if (currentIndex > 0) {
                  setCurrentStage(STAGES[currentIndex - 1].id);
                }
              }}
              variant="secondary"
              disabled={currentStage === 'intro'}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              {STAGES.map(stage => {
                const isUnlocked = stage.unlocked || (stage.requiredGames && totalGames >= stage.requiredGames);
                return (
                  <button
                    key={stage.id}
                    onClick={() => isUnlocked && setCurrentStage(stage.id)}
                    disabled={!isUnlocked}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      currentStage === stage.id ? "w-8 bg-blue-600" : 
                      isUnlocked ? "bg-neutral-600 hover:bg-neutral-500" : 
                      "bg-neutral-800"
                    )}
                  />
                );
              })}
            </div>
            
            <Button
              onClick={() => {
                const currentIndex = STAGES.findIndex(s => s.id === currentStage);
                if (currentIndex < STAGES.length - 1) {
                  const nextStage = STAGES[currentIndex + 1];
                  const isUnlocked = nextStage.unlocked || (nextStage.requiredGames && totalGames >= nextStage.requiredGames);
                  if (isUnlocked) {
                    setCurrentStage(nextStage.id);
                  }
                }
              }}
              variant="primary"
              disabled={
                currentStage === 'simulation' || 
                (STAGES[STAGES.findIndex(s => s.id === currentStage) + 1]?.requiredGames > totalGames)
              }
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}

// Intro Stage Component
const IntroStage = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to the Monty Hall Masterclass!",
      content: "You're about to embark on a journey through one of probability's most famous paradoxes.",
      visual: "doors"
    },
    {
      title: "The Setup",
      content: "Three doors. One car. Two goats. You pick a door, the host reveals a goat, then offers you a choice: switch or stay?",
      visual: "scenario"
    },
    {
      title: "The Controversy",
      content: "When Marilyn vos Savant published the solution in 1990, thousands of people - including PhD mathematicians - told her she was wrong. She wasn't.",
      visual: "history"
    },
    {
      title: "Your Journey",
      content: "You'll play the game, discover the pattern, understand the mathematics, and see the proof emerge through simulation. Ready?",
      visual: "journey"
    }
  ];
  
  return (
    <GraphContainer height="500px" className="flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl text-center space-y-6">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              {steps[step].title}
            </h2>
            <p className="text-lg text-neutral-300 mb-8">
              {steps[step].content}
            </p>
            
            {/* Visual representations */}
            {step === 0 && (
              <div className="flex justify-center gap-8 mb-8">
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                    className="w-24 h-32 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-2xl font-bold"
                  >
                    {i}
                  </motion.div>
                ))}
              </div>
            )}
            
            {step === 3 && (
              <div className="grid grid-cols-4 gap-4 mb-8">
                {STAGES.map((stage, i) => (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-neutral-800 rounded-lg"
                  >
                    <stage.icon className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm text-neutral-300">{stage.title}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
          
          <div className="flex justify-center gap-4">
            {step > 0 && (
              <Button
                onClick={() => setStep(step - 1)}
                variant="secondary"
              >
                Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button
                onClick={() => setStep(step + 1)}
                variant="primary"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={onComplete}
                variant="success"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start Learning!
              </Button>
            )}
          </div>
        </div>
      </div>
    </GraphContainer>
  );
};

// Interactive Stage Wrapper Component
const InteractiveStageWrapper = ({ onGameComplete, totalGames }) => {
  const [showHelpOverlay, setShowHelpOverlay] = useState(totalGames === 0);
  const [lastGameCount, setLastGameCount] = useState(0);
  const [showGameTip, setShowGameTip] = useState(false);
  const containerRef = useRef(null);
  
  // Poll for game completion by checking the game history text
  useEffect(() => {
    let checkCount = 0;
    const checkGameState = () => {
      // Look for the game count in the statistics section
      const gameCountElement = document.querySelector('.text-mono.text-teal-400');
      if (gameCountElement) {
        const match = gameCountElement.textContent.match(/(\d+)\/(\d+)/);
        if (match) {
          const currentCount = parseInt(match[1]);
          if (currentCount > lastGameCount) {
            // New game completed!
            const difference = currentCount - lastGameCount;
            for (let i = 0; i < difference; i++) {
              onGameComplete({ strategy: 'unknown', won: false });
            }
            setLastGameCount(currentCount);
            
            // Show tip after 3 games if user hasn't played more
            if (currentCount === 3 && checkCount < 20) {
              setShowGameTip(true);
              setTimeout(() => setShowGameTip(false), 8000);
            }
          }
        }
      }
      
      // Also check for the WIN/LOSE status to guide users
      const winElement = document.querySelector('span.bg-green-600');
      const loseElement = document.querySelector('span.bg-red-600');
      if ((winElement || loseElement) && checkCount % 30 === 0) { // Check every 3 seconds
        // Game has ended, show guidance
        setTimeout(() => {
          const buttons = document.querySelectorAll('button');
          const newGameBtn = Array.from(buttons).find(btn => btn.textContent.includes('New Game'));
          if (newGameBtn && !newGameBtn.disabled) {
            // Add pulsing effect to New Game button
            newGameBtn.classList.add('animate-pulse', 'ring-2', 'ring-blue-400');
            setTimeout(() => {
              newGameBtn.classList.remove('animate-pulse', 'ring-2', 'ring-blue-400');
            }, 3000);
          }
        }, 2000);
      }
      
      checkCount++;
    };
    
    // Check immediately and then every 100ms
    checkGameState();
    const interval = setInterval(checkGameState, 100);
    
    return () => clearInterval(interval);
  }, [lastGameCount, onGameComplete]);
  
  return (
    <div className="relative" ref={containerRef}>
      {/* Help overlay for first-time users */}
      <AnimatePresence>
        {showHelpOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-40 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-neutral-900/95 backdrop-blur p-6 rounded-lg max-w-md mx-4 border border-blue-600/50 pointer-events-auto"
            >
              <h3 className="text-xl font-bold text-white mb-3">
                Let's Play the Monty Hall Game!
              </h3>
              <div className="space-y-3 text-sm text-neutral-300">
                <p>
                  1️⃣ Click on a door to make your initial choice
                </p>
                <p>
                  2️⃣ The host will reveal a goat behind another door
                </p>
                <p>
                  3️⃣ Decide: Stay with your door or switch?
                </p>
                <p className="text-amber-400 font-medium">
                  🎯 Goal: Play at least 10 games to see the pattern emerge!
                </p>
              </div>
              <Button
                onClick={() => setShowHelpOverlay(false)}
                variant="primary"
                className="w-full mt-4"
              >
                Got it, let's play!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main game component */}
      <div className="monty-hall-game-wrapper">
        <MontyHallInteractive />
      </div>
      
      {/* Game tip overlay */}
      <AnimatePresence>
        {showGameTip && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-20 left-4 bg-amber-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-xs pointer-events-none"
          >
            <p className="text-sm">
              💡 Tip: Try the "Auto Play" button with "Switch" strategy to quickly see why switching is better!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating helper for game milestones */}
      {totalGames > 0 && totalGames % 5 === 0 && totalGames < 30 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg max-w-xs"
        >
          <p className="text-sm font-medium">
            {totalGames < 10 
              ? `Great progress! ${10 - totalGames} more games to unlock Stage 2!`
              : totalGames < 20
              ? `Keep going! ${20 - totalGames} more games to unlock Stage 3!`
              : `Almost there! ${30 - totalGames} more games to complete the journey!`
            }
          </p>
        </motion.div>
      )}
      
      {/* Next stage prompt when milestone reached */}
      {(totalGames === 10 || totalGames === 20 || totalGames === 30) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-40"
        >
          <div className="bg-neutral-900 p-8 rounded-lg max-w-md mx-4 border border-green-600/50 text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Stage Unlocked! 🎉
            </h3>
            <p className="text-neutral-300 mb-6">
              {totalGames === 10 && "You've played 10 games! Ready to understand the math behind it?"}
              {totalGames === 20 && "20 games completed! Time to see the proof with Bayes' theorem!"}
              {totalGames === 30 && "Amazing! You've completed 30 games. See the pattern at scale!"}
            </p>
            <Button
              onClick={() => {
                const buttons = document.querySelectorAll('button');
                const nextBtn = Array.from(buttons).find(btn => btn.textContent.includes('Next'));
                if (nextBtn) nextBtn.click();
              }}
              variant="success"
              size="lg"
            >
              Continue to Next Stage
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MontyHallMasterclass;