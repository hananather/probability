"use client";

import React, { useState } from 'react';
import { useMathJax } from '../../../hooks/useMathJax';
import SectionBasedContent, { 
  SectionContent, 
  InteractiveElement 
} from '@/components/ui/SectionBasedContent';
import { WorkedExample, ExampleSection, InsightBox, Formula, Step } from '@/components/ui/WorkedExample';
import { Button } from '@/components/ui/button';
import { VisualizationSection } from '@/components/ui/VisualizationContainer';
import { CheckCircle2, XCircle } from 'lucide-react';

// Create section content components outside to avoid conditional hooks
const BasicExampleSection = ({ showSolution, setShowSolution }) => {
  const contentRef = useMathJax([showSolution]);
      
  return (
    <SectionContent>
      <div ref={contentRef}>
        <WorkedExample title="Microservices Deployment Sequence">
          <ExampleSection title="Real Production Scenario">
            <div className="bg-neutral-800 p-4 rounded-lg">
              <p className="text-neutral-300 mb-3">
                <span className="text-amber-400 font-medium">Context:</span> You're deploying a payment processing system 
                with 8 microservices. The deployment order matters because services have dependencies.
              </p>
              <div className="bg-blue-900/20 p-3 rounded mb-3">
                <p className="text-sm text-blue-300 font-medium mb-2">Services:</p>
                <p className="text-xs text-neutral-400">
                  Auth, Database, Cache, Payment Gateway, Fraud Detection, 
                  Notification, Analytics, Load Balancer
                </p>
              </div>
              <p className="text-neutral-300">
                You need to deploy 3 services in the critical path first. Calculate deployment sequences if:
              </p>
              <ol className="list-decimal list-inside mt-3 space-y-2 text-neutral-300 ml-4">
                <li>Services can be redeployed (rolling updates)?</li>
                <li>Each service deploys only once (blue-green deployment)?</li>
              </ol>
              <div className="mt-3 bg-amber-900/20 p-2 rounded text-xs text-amber-300">
                Impact: Wrong order = 15 min downtime = $50K lost revenue
              </div>
            </div>
          </ExampleSection>
          
          <Button 
            onClick={() => setShowSolution(!showSolution)}
            variant="outline"
            className="my-4"
          >
            {showSolution ? 'Hide' : 'Show'} Step-by-Step Solution
          </Button>
          
          {showSolution && (
            <>
              <ExampleSection title="Part 1: Rolling Updates (With Replacement)">
                <Step number={1} description="Understand the scenario">
                  <p className="text-neutral-300 mb-2">
                    Rolling updates allow redeploying the same service multiple times:
                  </p>
                  <ul className="list-disc list-inside text-sm text-neutral-400 ml-4">
                    <li>Deploy v1 → Test → Deploy v1.1 → Test → Deploy v1.2</li>
                    <li>Common in iterative debugging or configuration tuning</li>
                  </ul>
                </Step>
                
                <Step number={2} description="Identify parameters and apply formula">
                  <p className="text-neutral-300">
                    • <span dangerouslySetInnerHTML={{ __html: `\\(n = 8\\)` }} /> (total services)<br/>
                    • <span dangerouslySetInnerHTML={{ __html: `\\(r = 3\\)` }} /> (deployment slots)
                  </p>
                  <div className="mt-2" dangerouslySetInnerHTML={{ 
                    __html: `\\[\\text{Deployment sequences} = n^r = 8^3\\]` 
                  }} />
                </Step>
                
                <Step number={3} description="Calculate">
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[8^3 = 8 \\times 8 \\times 8 = 512\\]` 
                  }} />
                </Step>
                
                <InsightBox variant="success">
                  Answer: 512 different deployment sequences possible
                </InsightBox>
              </ExampleSection>
              
              <ExampleSection title="Part 2: Blue-Green Deployment (Without Replacement)">
                <Step number={1} description="Understand the constraint">
                  <p className="text-neutral-300 mb-2">
                    Blue-green deployment means each service deploys exactly once:
                  </p>
                  <ul className="list-disc list-inside text-sm text-neutral-400 ml-4">
                    <li>Deploy to "green" environment while "blue" serves traffic</li>
                    <li>Switch traffic after all validations pass</li>
                    <li>No service can deploy twice in the sequence</li>
                  </ul>
                </Step>
                
                <Step number={2} description="Apply permutation formula">
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[P(8,3) = \\frac{8!}{(8-3)!} = \\frac{8!}{5!}\\]` 
                  }} />
                </Step>
                
                <Step number={3} description="Calculate step by step">
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[P(8,3) = 8 \\times 7 \\times 6 = 336\\]` 
                  }} />
                  <p className="text-neutral-300 mt-2">
                    • 1st service: 8 choices<br/>
                    • 2nd service: 7 choices (one deployed)<br/>
                    • 3rd service: 6 choices (two deployed)
                  </p>
                </Step>
                
                <InsightBox variant="success">
                  Answer: 336 different deployment sequences possible
                </InsightBox>
              </ExampleSection>
              
              <ExampleSection title="Real-World Impact">
                <div className="bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-neutral-300 mb-2">
                    <span className="font-medium text-purple-400">Why this matters:</span>
                  </p>
                  <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
                    <li>Rolling updates: <span className="font-mono text-purple-400">512/336 = 1.52×</span> more flexibility</li>
                    <li>Trade-off: More sequences to test vs. ability to iteratively fix issues</li>
                    <li>Wrong sequence (e.g., Payment before Database) = system failure</li>
                    <li>Automated deployment tools must validate dependency order</li>
                  </ul>
                </div>
              </ExampleSection>
            </>
          )}
        </WorkedExample>
      </div>
    </SectionContent>
  );
};

const ExamLevelSection = ({ showHints, setShowHints, showSolution, setShowSolution }) => {
  const contentRef = useMathJax([showHints, showSolution]);
  
  return (
    <SectionContent>
      <div ref={contentRef}>
        <WorkedExample title="Complex Scheduling Problem">
          <ExampleSection title="The Challenge">
            <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/30">
              <p className="text-neutral-300 mb-3">
                A data science team has 12 different ML models to evaluate. They need to:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-neutral-300 ml-4">
                <li>Select 4 models for detailed analysis (order matters for presentation)</li>
                <li>The first 2 selected will also be deployed to production</li>
                <li>Production models must be different (no model deployed twice)</li>
              </ol>
              <p className="text-neutral-300 mt-3">
                How many ways can they organize this evaluation process?
              </p>
            </div>
          </ExampleSection>
          
          <div className="flex gap-2 my-4">
            <Button 
              onClick={() => setShowHints(!showHints)}
              variant="outline"
              size="sm"
            >
              {showHints ? 'Hide' : 'Show'} Hints
            </Button>
            <Button 
              onClick={() => setShowSolution(!showSolution)}
              variant="outline"
              size="sm"
            >
              {showSolution ? 'Hide' : 'Show'} Full Solution
            </Button>
          </div>
          
          {showHints && (
            <ExampleSection title="Hints">
              <div className="space-y-2">
                <div className="bg-blue-900/20 p-3 rounded text-sm">
                  This is a two-stage problem - break it down!
                </div>
                <div className="bg-green-900/20 p-3 rounded text-sm">
                  First 2 positions: without replacement (production constraint)
                </div>
                <div className="bg-purple-900/20 p-3 rounded text-sm">
                  Positions 3-4: can these repeat earlier selections?
                </div>
              </div>
            </ExampleSection>
          )}
          
          {showSolution && (
            <>
              <ExampleSection title="Solution Approach">
                <Step number={1} description="Understand the constraints">
                  <ul className="list-disc list-inside text-neutral-300 space-y-1">
                    <li>Positions 1-2: Must be different (production deployment)</li>
                    <li>Positions 3-4: Can be any of the 12 models</li>
                    <li>Order matters for all 4 positions</li>
                  </ul>
                </Step>
                
                <Step number={2} description="Calculate positions 1-2">
                  <p className="text-neutral-300 mb-2">
                    Without replacement for first 2:
                  </p>
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[P(12,2) = 12 \\times 11 = 132\\]` 
                  }} />
                </Step>
                
                <Step number={3} description="Calculate positions 3-4">
                  <p className="text-neutral-300 mb-2">
                    Each can be any of the 12 models:
                  </p>
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[12^2 = 12 \\times 12 = 144\\]` 
                  }} />
                </Step>
                
                <Step number={4} description="Apply multiplication principle">
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[\\text{Total} = 132 \\times 144 = 19,008\\]` 
                  }} />
                </Step>
              </ExampleSection>
              
              <ExampleSection title="Verification">
                <div className="bg-neutral-800 p-4 rounded-lg">
                  <p className="text-sm text-neutral-300">
                    Alternative calculation:
                  </p>
                  <div className="mt-2" dangerouslySetInnerHTML={{ 
                    __html: `\\[(12 \\times 11) \\times (12 \\times 12) = 132 \\times 144 = 19,008 \\checkmark\\]` 
                  }} />
                </div>
              </ExampleSection>
              
              <InsightBox variant="warning">
                Common Mistake: Treating all 4 positions the same would give 
                <span dangerouslySetInnerHTML={{ __html: ` \\(P(12,4) = 11,880\\)` }} /> or 
                <span dangerouslySetInnerHTML={{ __html: ` \\(12^4 = 20,736\\)` }} />, 
                both incorrect!
              </InsightBox>
            </>
          )}
        </WorkedExample>
      </div>
    </SectionContent>
  );
};

const VariationsSection = ({ selectedVariation, setSelectedVariation }) => {
  const contentRef = useMathJax([selectedVariation]);
  
  const variations = [
    {
      id: 'circular',
      title: 'Circular Arrangements',
      problem: '5 people sitting at a round table',
      solution: '(5-1)! = 4! = 24',
      explanation: 'In circular arrangements, rotations are considered the same'
    },
    {
      id: 'restrictions',
      title: 'With Restrictions',
      problem: 'Arrange 6 books where 2 specific books must be together',
      solution: 'Treat as 5 units: 5! × 2! = 240',
      explanation: 'Group restricted items as one unit, then arrange internally'
    },
    {
      id: 'repetition',
      title: 'With Repetition',
      problem: 'Arrange letters in "STATISTICS"',
      solution: '10!/(3!×3!×2!) = 50,400',
      explanation: 'Divide by factorial of each repetition count'
    }
  ];
  
  return (
    <SectionContent>
      <div ref={contentRef}>
        <WorkedExample title="Common Variation Types">
          <ExampleSection title="Select a Variation to Explore">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {variations.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariation(v.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedVariation === v.id 
                      ? 'bg-purple-900/30 border-purple-600' 
                      : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <h5 className="font-semibold text-white">{v.title}</h5>
                  <p className="text-xs text-neutral-400 mt-1">{v.problem}</p>
                </button>
              ))}
            </div>
          </ExampleSection>
          
          {selectedVariation && (
            <ExampleSection title="Solution">
              {(() => {
                const variation = (variations || []).find(v => v.id === selectedVariation);
                if (!variation) return <div>Variation not found</div>;
                return (
                  <div className="space-y-3">
                    <div className="bg-neutral-800 p-4 rounded-lg">
                      <p className="text-neutral-300 font-medium mb-2">
                        Problem: {variation.problem}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {variation.explanation}
                      </p>
                    </div>
                    <div className="bg-purple-900/20 p-4 rounded-lg">
                      <p className="text-sm text-neutral-300 mb-2">Solution:</p>
                      <div className="text-lg font-mono text-purple-400" 
                           dangerouslySetInnerHTML={{ __html: `\\[${variation.solution}\\]` }} />
                    </div>
                  </div>
                );
              })()}
            </ExampleSection>
          )}
          
          <ExampleSection title="Quick Recognition Guide">
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-neutral-300">
                  <strong>Standard permutation:</strong> "Arrange n items in r positions"
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-neutral-300">
                  <strong>With replacement:</strong> "Can reuse", "with repetition allowed"
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span className="text-neutral-300">
                  <strong>Circular:</strong> "Around a table", "in a circle"
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-neutral-300">
                  <strong>Restrictions:</strong> "Must be adjacent", "cannot be next to"
                </span>
              </div>
            </div>
          </ExampleSection>
        </WorkedExample>
      </div>
    </SectionContent>
  );
};

const PracticeSection = ({ 
  currentProblem, 
  setCurrentProblem, 
  showAnswer, 
  setShowAnswer, 
  userAnswer, 
  setUserAnswer, 
  feedback, 
  setFeedback 
}) => {
  const contentRef = useMathJax([currentProblem]);
  
  const problems = [
    {
      question: "A password must be 4 digits long. How many possible passwords exist?",
      answer: "10000",
      solution: "10^4 = 10,000 (each position has 10 choices: 0-9)",
      hint: "With replacement - digits can repeat"
    },
    {
      question: "In how many ways can you arrange 5 different books on a shelf?",
      answer: "120",
      solution: "5! = 5 × 4 × 3 × 2 × 1 = 120",
      hint: "All books used, order matters"
    },
    {
      question: "From 8 candidates, select a president, VP, and treasurer. How many ways?",
      answer: "336",
      solution: "P(8,3) = 8 × 7 × 6 = 336",
      hint: "Different people for different positions"
    }
  ];
  
  const checkAnswer = () => {
    const correct = userAnswer.trim() === problems[currentProblem].answer;
    setFeedback({
      correct,
      message: correct ? "Correct! Well done!" : "Not quite. Try again or view the solution."
    });
  };
  
  const nextProblem = () => {
    setCurrentProblem((prev) => (prev + 1) % problems.length);
    setShowAnswer(false);
    setUserAnswer('');
    setFeedback(null);
  };
  
  return (
    <SectionContent>
      <div ref={contentRef}>
        <WorkedExample title="Test Your Understanding">
          <ExampleSection title={`Problem ${currentProblem + 1} of ${problems.length}`}>
            <div className="bg-neutral-800 p-4 rounded-lg">
              <p className="text-neutral-300 font-medium">
                {problems[currentProblem].question}
              </p>
              <p className="text-sm text-neutral-400 mt-2">
                Hint: {problems[currentProblem].hint}
              </p>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white"
                  onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                />
                <Button onClick={checkAnswer} variant="outline">
                  Check
                </Button>
              </div>
              
              {feedback && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  feedback.correct ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                }`}>
                  {feedback.correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {feedback.message}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowAnswer(!showAnswer)}
                  variant="outline"
                  size="sm"
                >
                  {showAnswer ? 'Hide' : 'Show'} Solution
                </Button>
                <Button 
                  onClick={nextProblem}
                  variant="outline"
                  size="sm"
                >
                  Next Problem
                </Button>
              </div>
              
              {showAnswer && (
                <div className="bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-neutral-300">
                    <strong>Solution:</strong> {problems[currentProblem].solution}
                  </p>
                </div>
              )}
            </div>
          </ExampleSection>
          
          <ExampleSection title="Progress">
            <div className="flex gap-1">
              {problems.map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-2 rounded ${
                    i === currentProblem ? 'bg-blue-500' : 'bg-neutral-700'
                  }`}
                />
              ))}
            </div>
          </ExampleSection>
        </WorkedExample>
      </div>
    </SectionContent>
  );
};

export default function Tab2WorkedExamplesTab({ onComplete }) {
  // All hooks called consistently at the top level
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showExamSolution, setShowExamSolution] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  const SECTIONS = [
    {
      id: 'basic-example',
      title: 'Basic Example',
      content: ({ sectionIndex, isCompleted }) => (
        <BasicExampleSection 
          showSolution={showSolution} 
          setShowSolution={setShowSolution} 
        />
      )
    },
    {
      id: 'exam-level',
      title: 'Exam-Level Example',
      content: ({ sectionIndex, isCompleted }) => (
        <ExamLevelSection 
          showHints={showHints} 
          setShowHints={setShowHints}
          showSolution={showExamSolution} 
          setShowSolution={setShowExamSolution}
        />
      )
    },
    {
      id: 'variations',
      title: 'Variations',
      content: ({ sectionIndex, isCompleted }) => (
        <VariationsSection 
          selectedVariation={selectedVariation} 
          setSelectedVariation={setSelectedVariation}
        />
      )
    },
    {
      id: 'practice',
      title: 'Practice Time',
      content: ({ sectionIndex, isCompleted }) => (
        <PracticeSection
          currentProblem={currentProblem}
          setCurrentProblem={setCurrentProblem}
          showAnswer={showAnswer}
          setShowAnswer={setShowAnswer}
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          feedback={feedback}
          setFeedback={setFeedback}
        />
      )
    }
  ];

  return (
    <SectionBasedContent
      title="Worked Examples - Ordered Sampling"
      description="Step-by-step solutions to build your confidence"
      sections={SECTIONS}
      onComplete={onComplete}
      progressVariant="blue"
    />
  );
}