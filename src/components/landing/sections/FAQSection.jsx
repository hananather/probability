'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '../../../lib/design-system';

const faqs = [
  {
    question: "What if I'm struggling with the math prerequisites?",
    answer: "Don't worry! We've built a prerequisites checker that helps you identify gaps in your knowledge. Each chapter also includes review sections for relevant math concepts. Start with Chapter 1, which covers fundamentals and builds up gradually. The interactive visualizations help you understand concepts even if the math feels challenging."
  },
  {
    question: "How long does each chapter take to complete?",
    answer: "On average, students spend 3-5 hours per chapter, including practice problems. However, you can go at your own pace. Each chapter is broken into bite-sized sections (10-20 minutes each) that you can complete individually. The platform saves your progress automatically."
  },
  {
    question: "Can I skip ahead to specific topics I need help with?",
    answer: "Yes! While we recommend following the sequential path for the best learning experience, you can jump to any chapter or section you need. Use the navigation menu or search function to find specific topics. Just be aware that later chapters build on earlier concepts."
  },
  {
    question: "How do the interactive visualizations help me learn?",
    answer: "Our visualizations let you manipulate variables and see immediate results, building intuition for abstract concepts. Instead of memorizing formulas, you'll understand WHY they work through hands-on experimentation. Active learning through interaction helps improve understanding and retention."
  },
  {
    question: "Is this suitable for my course (MAT 2377 or similar)?",
    answer: "Yes! This platform covers standard probability and statistics topics taught in engineering courses. We align with common textbooks and curricula. Check the chapter overview to match topics with your syllabus. This content is suitable for courses like MAT 2377, STAT 2507, and similar."
  },
  {
    question: "Do I need to install any software?",
    answer: "No installation required! Everything runs in your web browser. The platform works on computers, tablets, and phones. For the best experience, we recommend using a modern browser (Chrome, Firefox, Safari, or Edge) on a device with at least a 10-inch screen."
  },
  {
    question: "How is this different from watching video lectures?",
    answer: "Instead of passive watching, you're actively engaged. You can pause, experiment, and test hypotheses in real-time. Each concept has multiple representations (visual, numerical, and symbolic) to match different learning styles. Plus, you get immediate feedback on practice problems."
  },
  {
    question: "What if I get stuck on a problem?",
    answer: "Each problem includes hints that guide you toward the solution without giving it away. Worked examples show step-by-step solutions to similar problems. If you're still stuck, the Help section connects you with additional resources and office hours information."
  }
];

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="border-b border-neutral-800 last:border-0">
      <button
        onClick={onToggle}
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
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isOpen ? "max-h-96" : "max-h-0"
      )}>
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

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <p className="text-neutral-400 mb-4">
            Still have questions?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@problab.com" 
              className="inline-flex items-center justify-center px-6 py-2 border border-neutral-600 rounded-lg text-white hover:bg-neutral-800 transition-colors"
            >
              Contact Support
            </a>
            <a 
              href="/prerequisites" 
              className="inline-flex items-center justify-center px-6 py-2 bg-teal-600 rounded-lg text-white hover:bg-teal-700 transition-colors"
            >
              Check Prerequisites
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}