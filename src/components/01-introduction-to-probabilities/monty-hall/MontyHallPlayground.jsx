"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer
} from '../../ui/VisualizationContainer';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/design-system';
import MontyDoor from './MontyDoor';
import MontyStats from './MontyStats';
import MontyProbabilityBar from './MontyProbabilityBar';

const MontyHallPlayground = () => {
  // Game state
  const [gamePhase, setGamePhase] = useState('initial'); // initial, firstChoice, hostReveal, finalChoice, result
  const [carPosition, setCarPosition] = useState(null);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [hostReveal, setHostReveal] = useState(null);
  const [finalChoice, setFinalChoice] = useState(null);
  const [didSwitch, setDidSwitch] = useState(false);
  const [gameResult, setGameResult] = useState(null); // 'win' or 'lose'
  
  // Statistics
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [switchWins, setSwitchWins] = useState(0);
  const [stayWins, setStayWins] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  
  // Initialize car position
  const initializeGame = useCallback(() => {
    setCarPosition(Math.floor(Math.random() * 3));
    setGamePhase('initial');
    setPlayerChoice(null);
    setHostReveal(null);
    setFinalChoice(null);
    setDidSwitch(false);
    setGameResult(null);
  }, []);

  // Start new game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle door selection
  const handleDoorClick = useCallback((doorIndex) => {
    if (gamePhase === 'initial') {
      setPlayerChoice(doorIndex);
      setGamePhase('firstChoice');
      
      // Host reveals a goat door after a delay
      setTimeout(() => {
        // Find doors with goats that aren't the player's choice
        const goatDoors = [0, 1, 2].filter(i => i !== doorIndex && i !== carPosition);
        const revealDoor = goatDoors[Math.floor(Math.random() * goatDoors.length)];
        setHostReveal(revealDoor);
        setGamePhase('hostReveal');
      }, 800);
    }
  }, [gamePhase, carPosition]);

  // Handle switch/stay decision
  const handleDecision = useCallback((switchDoor) => {
    if (gamePhase !== 'hostReveal') return;
    
    let newChoice;
    if (switchDoor) {
      // Find the remaining door
      newChoice = [0, 1, 2].find(i => i !== playerChoice && i !== hostReveal);
      setDidSwitch(true);
    } else {
      newChoice = playerChoice;
      setDidSwitch(false);
    }
    
    setFinalChoice(newChoice);
    setGamePhase('finalChoice');
    
    // Reveal result after delay
    setTimeout(() => {
      const won = newChoice === carPosition;
      setGameResult(won ? 'win' : 'lose');
      setGamePhase('result');
      
      // Update statistics
      setGamesPlayed(prev => prev + 1);
      if (switchDoor) {
        if (won) setSwitchWins(prev => prev + 1);
      } else {
        if (won) setStayWins(prev => prev + 1);
      }
      
      if (won) {
        setCurrentStreak(prev => prev + 1);
      } else {
        setCurrentStreak(0);
      }
    }, 1000);
  }, [gamePhase, playerChoice, hostReveal, carPosition]);

  // Get door state
  const getDoorState = (doorIndex) => {
    if (gamePhase === 'result') {
      return 'revealed';
    }
    if (doorIndex === hostReveal && gamePhase !== 'initial') {
      return 'revealed';
    }
    if (doorIndex === playerChoice && gamePhase !== 'result') {
      return 'selected';
    }
    if (gamePhase === 'hostReveal' && doorIndex !== playerChoice && doorIndex !== hostReveal) {
      return 'closed';
    }
    if (gamePhase === 'finalChoice' && doorIndex === finalChoice) {
      return 'selected';
    }
    return 'closed';
  };

  // Get door prize
  const getDoorPrize = (doorIndex) => {
    return doorIndex === carPosition ? 'car' : 'goat';
  };

  // Get instruction text
  const getInstructionText = () => {
    switch (gamePhase) {
      case 'initial':
        return "Choose a door! One hides a car, two hide goats.";
      case 'firstChoice':
        return "Good choice! Let me help you out...";
      case 'hostReveal':
        return "I've revealed a goat! Do you want to switch doors or stay?";
      case 'finalChoice':
        return didSwitch ? "You switched! Let's see..." : "You stayed! Let's see...";
      case 'result':
        return gameResult === 'win' 
          ? "🎉 Congratulations! You won the car!" 
          : "🐐 You got a goat. Better luck next time!";
      default:
        return "";
    }
  };

  return (
    <VisualizationContainer 
      title="Monty Hall Problem - Interactive Game"
      className="max-w-6xl mx-auto"
    >
      {/* Game Status */}
      <div className="text-center mb-8">
        <h3 className={cn(
          "text-2xl font-bold mb-2",
          gameResult === 'win' ? 'text-yellow-400' : 'text-white'
        )}>
          {getInstructionText()}
        </h3>
        {gamePhase === 'hostReveal' && (
          <p className="text-neutral-400 text-sm">
            The host always reveals a goat, never the car!
          </p>
        )}
      </div>

      {/* Main Game Area */}
      <GraphContainer height="400px" className="mb-8">
        <div className="flex justify-center items-center gap-8 h-full">
          {[0, 1, 2].map((doorIndex) => (
            <MontyDoor
              key={doorIndex}
              doorNumber={doorIndex + 1}
              state={getDoorState(doorIndex)}
              prize={getDoorPrize(doorIndex)}
              onClick={() => handleDoorClick(doorIndex)}
              animationDelay={doorIndex * 100}
            />
          ))}
        </div>
      </GraphContainer>

      {/* Decision Buttons */}
      {gamePhase === 'hostReveal' && (
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => handleDecision(true)}
            variant="primary"
            size="lg"
            className="min-w-32"
          >
            Switch Door
          </Button>
          <Button
            onClick={() => handleDecision(false)}
            variant="secondary"
            size="lg"
            className="min-w-32"
          >
            Stay
          </Button>
        </div>
      )}

      {/* Play Again Button */}
      {gamePhase === 'result' && (
        <div className="flex justify-center mb-8">
          <Button
            onClick={initializeGame}
            variant="success"
            size="lg"
          >
            Play Again
          </Button>
        </div>
      )}

      {/* Statistics and Insights */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Game Stats */}
        <VisualizationSection className="lg:col-span-2">
          <MontyStats
            gamesPlayed={gamesPlayed}
            switchWins={switchWins}
            stayWins={stayWins}
            currentStreak={currentStreak}
            variant="detailed"
          />
        </VisualizationSection>

        {/* Insights */}
        <VisualizationSection className="p-4 bg-neutral-800 rounded-lg">
          <h4 className="text-base font-semibold text-white mb-3">Key Insight</h4>
          <p className="text-sm text-neutral-300 mb-3">
            {gamesPlayed === 0 
              ? "Play a few games to see the pattern emerge!"
              : gamesPlayed < 10
              ? "Keep playing! The pattern becomes clearer with more games."
              : "Notice how switching wins about twice as often as staying!"}
          </p>
          {gamesPlayed >= 5 && (
            <div className="p-3 bg-neutral-900 rounded">
              <p className="text-xs text-neutral-400 mb-2">Why does switching win 2/3 of the time?</p>
              <p className="text-xs text-neutral-300">
                Your initial choice has 1/3 chance of being right. The other two doors 
                collectively have 2/3 chance. When the host reveals a goat, that 2/3 
                probability transfers to the remaining door!
              </p>
            </div>
          )}
        </VisualizationSection>
      </div>

      {/* Probability Visualization */}
      {gamesPlayed > 0 && (
        <div className="mt-6">
          <MontyProbabilityBar
            switchProb={gamesPlayed > 0 ? switchWins / gamesPlayed : 0.667}
            stayProb={gamesPlayed > 0 ? stayWins / gamesPlayed : 0.333}
          />
        </div>
      )}
    </VisualizationContainer>
  );
};

export default MontyHallPlayground;