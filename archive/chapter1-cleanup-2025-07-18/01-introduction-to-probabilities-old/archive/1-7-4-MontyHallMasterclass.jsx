"use client";
import React, { useState } from "react";
import { 
  VisualizationContainer, 
  GraphContainer
} from '../ui/VisualizationContainer';
import { typography, cn } from '../../lib/design-system';
import { Button } from '../ui/button';
import { 
  Brain, 
  ChevronRight, 
  ChevronLeft,
  Trophy, 
  Sparkles
} from 'lucide-react';
import MontyHallInteractive from './1-7-1-MontyHallInteractive';
import MontyHallBayesian from './1-7-2-MontyHallBayesian';
import MontyHallSimulation from './1-7-3-MontyHallSimulation';
import { motion, AnimatePresence } from 'framer-motion';

// Stage definitions
const STAGES = [
  {
    id: 'intro',
    title: 'The Paradox',
    subtitle: 'Welcome to the most counterintuitive problem in probability',
    icon: Brain
  },
  {
    id: 'interactive',
    title: 'Play & Discover',
    subtitle: 'Experience the problem firsthand',
    icon: Sparkles
  },
  {
    id: 'bayesian',
    title: 'Mathematical Proof',
    subtitle: 'Understand why switching works',
    icon: Brain
  },
  {
    id: 'simulation',
    title: 'Law of Large Numbers',
    subtitle: 'See the truth emerge at scale',
    icon: Trophy
  }
];

// Main Masterclass Component
function MontyHallMasterclass() {
  const [currentStage, setCurrentStage] = useState('intro');
  
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
    >
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
            <MontyHallInteractive embedded={true} />
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
          {STAGES.map(stage => (
            <button
              key={stage.id}
              onClick={() => setCurrentStage(stage.id)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentStage === stage.id ? "w-8 bg-blue-600" : "bg-neutral-600 hover:bg-neutral-500"
              )}
            />
          ))}
        </div>
        
        <Button
          onClick={() => {
            const currentIndex = STAGES.findIndex(s => s.id === currentStage);
            if (currentIndex < STAGES.length - 1) {
              setCurrentStage(STAGES[currentIndex + 1].id);
            }
          }}
          variant="primary"
          disabled={currentStage === 'simulation'}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
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


export default MontyHallMasterclass;