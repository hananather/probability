"use client";
import React, { useState } from 'react';
import { 
  VisualizationContainer, 
  VisualizationSection
} from '../../ui/VisualizationContainer';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/design-system';
import MontyDoor from './MontyDoor';

const MontyHallIntro = ({ onComplete }) => {
  const [stage, setStage] = useState('intro'); // intro, quiz, reveal
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [hoveredDoor, setHoveredDoor] = useState(null);

  const handleQuizAnswer = (answer) => {
    setQuizAnswer(answer);
    setTimeout(() => setStage('reveal'), 500);
  };

  return (
    <VisualizationContainer 
      title="The Monty Hall Problem"
      className="max-w-4xl mx-auto"
    >
      {stage === 'intro' && (
        <div className="text-center space-y-6">
          {/* Visual Hook */}
          <div className="flex justify-center gap-6 mb-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredDoor(i)}
                onMouseLeave={() => setHoveredDoor(null)}
                className="relative"
              >
                <MontyDoor
                  doorNumber={i + 1}
                  state={hoveredDoor === i ? 'selected' : 'closed'}
                  size="medium"
                />
                {hoveredDoor === i && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                    {i === 1 ? '🚗' : '🐐'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Introduction Text */}
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl font-bold text-white">
              Welcome to TV's Most Controversial Game Show!
            </h3>
            <p className="text-lg text-neutral-300">
              You're on a game show with three doors. Behind one door is a car, 
              behind the other two are goats. You pick a door, then the host 
              (who knows what's behind all doors) opens a different door revealing a goat.
            </p>
            <p className="text-lg text-neutral-300 font-semibold">
              Now comes the million-dollar question: Should you switch to the other unopened door, 
              or stick with your original choice?
            </p>
          </div>

          <Button
            onClick={() => setStage('quiz')}
            variant="primary"
            size="lg"
            className="mt-8"
          >
            Let's Find Out!
          </Button>
        </div>
      )}

      {stage === 'quiz' && (
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold text-white mb-8">
            What Would You Do?
          </h3>

          {/* Scenario Visualization */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <MontyDoor doorNumber={1} state="selected" size="medium" />
            <div className="text-3xl">→</div>
            <MontyDoor doorNumber={2} state="revealed" prize="goat" size="medium" />
            <div className="text-3xl">→</div>
            <MontyDoor doorNumber={3} state="closed" size="medium" />
          </div>

          <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
            You chose Door 1. The host opened Door 2, revealing a goat. 
            Door 3 remains closed. What's your strategy?
          </p>

          {/* Quiz Options */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={() => handleQuizAnswer('switch')}
              variant="primary"
              size="lg"
              className={cn(
                "min-w-40",
                quizAnswer === 'switch' && "ring-2 ring-blue-400"
              )}
            >
              Switch to Door 3
            </Button>
            <Button
              onClick={() => handleQuizAnswer('stay')}
              variant="secondary"
              size="lg"
              className={cn(
                "min-w-40",
                quizAnswer === 'stay' && "ring-2 ring-purple-400"
              )}
            >
              Stay with Door 1
            </Button>
            <Button
              onClick={() => handleQuizAnswer('same')}
              variant="neutral"
              size="lg"
              className={cn(
                "min-w-40",
                quizAnswer === 'same' && "ring-2 ring-neutral-400"
              )}
            >
              Doesn't Matter
            </Button>
          </div>
        </div>
      )}

      {stage === 'reveal' && (
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold text-white mb-4">
            The Surprising Truth
          </h3>

          {/* Results */}
          <div className="max-w-3xl mx-auto">
            {quizAnswer === 'switch' ? (
              <div className="p-6 bg-green-900/20 border border-green-700 rounded-lg mb-6">
                <p className="text-lg text-green-400 font-semibold mb-2">
                  🎉 Congratulations! You chose the optimal strategy!
                </p>
                <p className="text-neutral-300">
                  Switching gives you a 2/3 chance of winning the car. You're in the minority 
                  who got this right on first try!
                </p>
              </div>
            ) : (
              <div className="p-6 bg-amber-900/20 border border-amber-700 rounded-lg mb-6">
                <p className="text-lg text-amber-400 font-semibold mb-2">
                  🤔 You're not alone - most people get this wrong!
                </p>
                <p className="text-neutral-300">
                  {quizAnswer === 'stay' 
                    ? "Staying only gives you a 1/3 chance of winning."
                    : "It actually does matter - switching doubles your chances!"
                  }
                </p>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <VisualizationSection className="p-4 bg-neutral-800 rounded-lg">
                <p className="text-3xl font-bold text-green-400">2/3</p>
                <p className="text-sm text-neutral-400">Switch Win Rate</p>
              </VisualizationSection>
              <VisualizationSection className="p-4 bg-neutral-800 rounded-lg">
                <p className="text-3xl font-bold text-red-400">1/3</p>
                <p className="text-sm text-neutral-400">Stay Win Rate</p>
              </VisualizationSection>
              <VisualizationSection className="p-4 bg-neutral-800 rounded-lg">
                <p className="text-3xl font-bold text-yellow-400">2x</p>
                <p className="text-sm text-neutral-400">Better Odds</p>
              </VisualizationSection>
            </div>

            {/* Fun Facts */}
            <div className="bg-neutral-800 rounded-lg p-6 text-left space-y-3">
              <h4 className="text-base font-semibold text-white mb-3">Did You Know?</h4>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>When Marilyn vos Savant published the correct answer 
                  in 1990, she received thousands of letters - many from mathematicians - 
                  telling her she was wrong!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Even Paul Erdős, one of history's greatest mathematicians, 
                  didn't believe it until he saw computer simulations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Pigeons trained on this problem learn to switch and win more often than humans!</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Call to Action */}
          <div className="pt-6">
            <p className="text-lg text-neutral-300 mb-4">
              Ready to see why switching is better?
            </p>
            <Button
              onClick={onComplete}
              variant="success"
              size="lg"
            >
              Play the Game and See for Yourself!
            </Button>
          </div>
        </div>
      )}
    </VisualizationContainer>
  );
};

export default MontyHallIntro;