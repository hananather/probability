'use client';

import React, { useId, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '../../../lib/design-system';

const faqs = [
  {
    question: "What if I'm struggling with the math prerequisites?",
    answer: "Start with the prerequisites guide to review the mathematics you need. Chapter 1 introduces outcomes, events, and counting before conditional probability and Bayes' theorem. Work through a concrete example, then connect its diagram to the notation."
  },
  {
    question: "How long does each chapter take to complete?",
    answer: "Study at your own pace; chapter times are estimates, not measured averages. Choose one concept for a focused session, work through an example, and try a question without looking at the answer. Return to the idea in later sessions. Saved progress currently belongs to this browser and depends on available browser storage."
  },
  {
    question: "Can I skip ahead to specific topics I need help with?",
    answer: "Yes. Use the chapter cards or navigation menu to open a specific topic. Each chapter hub lists the suggested sequence and prerequisites, so you can review a missing foundation before continuing."
  },
  {
    question: "How do the interactive visualizations help me learn?",
    answer: "Predict what will happen before changing a parameter. Compare the graph with your prediction, then explain the result using the formula and its assumptions. The visualization gives you evidence to reason about; the worked examples and practice questions help you check that reasoning."
  },
  {
    question: "Is this suitable for my course (MAT 2377 or similar)?",
    answer: "The curriculum covers probability and statistics topics used in engineering courses, including MAT 2377. Compare the chapter list with your own syllabus, and use your instructor's definitions and requirements for assessed work."
  },
  {
    question: "Do I need to install any software?",
    answer: "No installation is required. Lessons run in a web browser. A larger screen gives detailed graphs more room; narrow screens can use the menu and scrollable diagrams. Use a current browser and report a control that does not work on your device."
  },
  {
    question: "How is this different from watching video lectures?",
    answer: "You can make predictions, change a model, inspect numerical results, and test your reasoning in practice questions. Diagrams, calculations, and notation show complementary parts of the same idea. Try explaining how they connect before moving on."
  },
  {
    question: "What if I get stuck on a problem?",
    answer: "Return to the relevant worked example and identify the first step you cannot explain. Review the symbols and assumptions, then retry the question. Available hints and answer explanations can help you compare your reasoning with a solution."
  }
];

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  const id = useId();
  return (
    <div className="border-b border-neutral-800 last:border-0">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${id}-answer`}
        className="w-full py-4 px-6 flex items-start justify-between text-left hover:bg-neutral-800/50 transition-colors"
      >
        <span className="text-white font-medium pr-4">{question}</span>
        <ChevronDown 
          className={cn(
            "h-5 w-5 text-neutral-400 flex-shrink-0 transition-transform",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      <div id={`${id}-answer`} hidden={!isOpen}>
        <div className="px-6 pb-4 text-neutral-300 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
};

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 lg:pl-32 bg-neutral-900">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <HelpCircle className="h-8 w-8 text-teal-400" />
            <h2 className="text-3xl font-bold text-white">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Common concerns from students like you. Click any question to learn more.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="bg-neutral-800/50 rounded-lg border border-neutral-700">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}