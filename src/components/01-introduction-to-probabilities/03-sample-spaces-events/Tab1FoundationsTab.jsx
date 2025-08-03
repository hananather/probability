"use client";

import React from 'react';
import SectionBasedContent from '@/components/ui/SectionBasedContent';
import { SimpleInsightBox, SimpleFormulaCard } from '@/components/ui/patterns/SimpleComponents';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';
import { SideBySideFormulas } from '@/components/ui/patterns/SideBySideFormulas';
import { ComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { useMathJax } from '@/hooks/useMathJax';

const SECTIONS = [
  {
    id: 'operations-foundation',
    title: 'The Grammar of Events',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useMathJax([sectionIndex, isCompleted]);
      
      return (
        <div ref={contentRef} className="space-y-6">
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-lg border border-blue-600/30">
            <h4 className="font-semibold text-blue-400 mb-4 text-lg">
              🔧 Set Operations: The Building Blocks of Complex Events
            </h4>
            <p className="text-neutral-200 mb-4">
              Just as sentences are built from words using grammatical rules, complex probability events 
              are built from simple events using set operations. These operations are the fundamental 
              "grammar" that lets us express any conceivable event.
            </p>
            
            <div className="bg-neutral-800/50 p-4 rounded">
              <p className="text-neutral-200 font-semibold mb-2">Core Principle:</p>
              <p className="text-neutral-300 text-sm">
                Every set operation has both a <span className="text-blue-400">mathematical definition</span> and 
                an <span className="text-green-400">intuitive meaning</span>. Understanding both perspectives 
                is crucial for mastering probability.
              </p>
            </div>
          </div>
        </div>
      );
    }
  },
  {
    id: 'fundamental-operations',
    title: 'The Four Fundamental Operations',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useMathJax([sectionIndex, isCompleted]);
      
      const operationsData = {
        title: "Complete Set Operations Reference",
        columns: [
          { key: 'operation', title: 'Operation', color: 'text-purple-400' },
          { key: 'definition', title: 'Mathematical Definition', color: 'text-blue-400' },
          { key: 'meaning', title: 'Intuitive Meaning', color: 'text-green-400' }
        ],
        rows: [
          {
            aspect: "Union",
            operation: "\\(A \\cup B\\)",
            definition: `\\(\\{x : x \\in A \\text{ or } x \\in B\\}\\)`,
            meaning: "Elements that belong to A, or B, or both"
          },
          {
            aspect: "Intersection",
            operation: "\\(A \\cap B\\)",
            definition: `\\(\\{x : x \\in A \\text{ and } x \\in B\\}\\)`,
            meaning: "Elements that belong to both A and B simultaneously"
          },
          {
            aspect: "Complement",
            operation: "\\(A^c\\)",
            definition: `\\(\\{x \\in S : x \\notin A\\}\\)`,
            meaning: "All elements in the sample space that are not in A"
          },
          {
            aspect: "Difference",
            operation: "\\(A \\setminus B\\)",
            definition: `\\(\\{x : x \\in A \\text{ and } x \\notin B\\}\\)`,
            meaning: "Elements in A but not in B (A excluding B)"
          }
        ]
      };
      
      return (
        <div ref={contentRef} className="space-y-6">
          <div className="bg-neutral-800/50 p-6 rounded-lg">
            <h4 className="font-semibold text-white mb-4 text-lg">
              📚 Complete Operation Definitions
            </h4>
            <p className="text-neutral-200 mb-4">
              Each set operation has a precise mathematical definition and a clear intuitive interpretation. 
              Understanding both aspects is essential for problem-solving confidence.
            </p>
            
            <ComparisonTable {...operationsData} />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-purple-900/20 p-5 rounded-lg border border-purple-600/30">
              <h5 className="font-semibold text-purple-400 mb-3 text-lg">Union</h5>
              <div className="space-y-3">
                <p className="text-neutral-200 text-sm">
                  <strong>Key Insight:</strong> Union is <em>inclusive</em> - it includes elements that are in A, 
                  or in B, or in both. The "or" in mathematics is always inclusive unless stated otherwise.
                </p>
                <div className="bg-neutral-800/50 p-3 rounded">
                  <p className="text-neutral-300 text-xs">
                    <strong>Formal logic:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(x \\in A \\cup B \\iff (x \\in A) \\lor (x \\in B)\\)` }} />
                  </p>
                </div>
                <p className="text-neutral-400 text-xs">
                  This means if an element belongs to A or B (or both), it belongs to their union.
                </p>
              </div>
            </div>
            
            <div className="bg-blue-900/20 p-5 rounded-lg border border-blue-600/30">
              <h5 className="font-semibold text-blue-400 mb-3 text-lg">Intersection</h5>
              <div className="space-y-3">
                <p className="text-neutral-200 text-sm">
                  <strong>Key Insight:</strong> Intersection requires <em>simultaneous membership</em> - 
                  an element must satisfy the conditions for A <strong>and</strong> satisfy the conditions for B.
                </p>
                <div className="bg-neutral-800/50 p-3 rounded">
                  <p className="text-neutral-300 text-xs">
                    <strong>Formal logic:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(x \\in A \\cap B \\iff (x \\in A) \\land (x \\in B)\\)` }} />
                  </p>
                </div>
                <p className="text-neutral-400 text-xs">
                  This is the most restrictive operation - only elements meeting all criteria qualify.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-900/20 p-5 rounded-lg border border-green-600/30">
              <h5 className="font-semibold text-green-400 mb-3 text-lg">🔄 Complement</h5>
              <div className="space-y-3">
                <p className="text-neutral-200 text-sm">
                  <strong>Key Insight:</strong> Complement is <em>relative to the sample space</em> - 
                  it includes everything in S that's not in A. The sample space context is crucial.
                </p>
                <div className="bg-neutral-800/50 p-3 rounded">
                  <p className="text-neutral-300 text-xs">
                    <strong>Critical property:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(A \\cup A^c = S\\)` }} /> and <span dangerouslySetInnerHTML={{ __html: `\\(A \\cap A^c = \\emptyset\\)` }} />
                  </p>
                </div>
                <p className="text-neutral-400 text-xs">
                  Together, A and its complement form a complete partition of the sample space.
                </p>
              </div>
            </div>
            
            <div className="bg-orange-900/20 p-5 rounded-lg border border-orange-600/30">
              <h5 className="font-semibold text-orange-400 mb-3 text-lg">➖ Difference</h5>
              <div className="space-y-3">
                <p className="text-neutral-200 text-sm">
                  <strong>Key Insight:</strong> Difference is <em>subtraction of sets</em> - 
                  it's what remains of A after removing anything that's also in B.
                </p>
                <div className="bg-neutral-800/50 p-3 rounded">
                  <p className="text-neutral-300 text-xs">
                    <strong>Equivalent forms:</strong> <span dangerouslySetInnerHTML={{ __html: `\\(A \\setminus B = A \\cap B^c\\)` }} />
                  </p>
                </div>
                <p className="text-neutral-400 text-xs">
                  This operation is not symmetric: A \ B ≠ B \ A in general.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  },
  {
    id: 'algebraic-properties',
    title: 'Algebraic Properties and Laws',
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useMathJax([sectionIndex, isCompleted]);
      
      return (
        <div ref={contentRef} className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-6 rounded-lg border border-indigo-600/30">
            <h4 className="font-semibold text-indigo-400 mb-4 text-lg">
              Fundamental Laws of Set Operations
            </h4>
            <p className="text-neutral-200 mb-4">
              Set operations follow precise algebraic laws, just like arithmetic. These laws allow us to 
              simplify complex expressions and solve problems systematically.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-blue-900/20 p-5 rounded-lg border border-blue-600/30">
              <h5 className="font-semibold text-blue-400 mb-3 text-lg">🔄 Commutative Laws</h5>
              <div className="space-y-3">
                <div className="bg-neutral-800/50 p-4 rounded">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-neutral-200 font-medium mb-2">Union:</p>
                      <p className="text-center"><span dangerouslySetInnerHTML={{ __html: `\\(A \\cup B = B \\cup A\\)` }} /></p>
                    </div>
                    <div>
                      <p className="text-neutral-200 font-medium mb-2">Intersection:</p>
                      <p className="text-center"><span dangerouslySetInnerHTML={{ __html: `\\(A \\cap B = B \\cap A\\)` }} /></p>
                    </div>
                  </div>
                </div>
                <p className="text-neutral-300 text-sm">
                  <strong>Meaning:</strong> Order doesn't matter for union and intersection. 
                  "A or B" is the same as "B or A", and "A and B" is the same as "B and A".
                </p>
              </div>
            </div>
            
            <div className="bg-green-900/20 p-5 rounded-lg border border-green-600/30">
              <h5 className="font-semibold text-green-400 mb-3 text-lg">Associative Laws</h5>
              <div className="space-y-3">
                <div className="bg-neutral-800/50 p-4 rounded">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-neutral-200 font-medium mb-2">Union:</p>
                      <p className="text-center"><span dangerouslySetInnerHTML={{ __html: `\\((A \\cup B) \\cup C = A \\cup (B \\cup C)\\)` }} /></p>
                    </div>
                    <div>
                      <p className="text-neutral-200 font-medium mb-2">Intersection:</p>
                      <p className="text-center"><span dangerouslySetInnerHTML={{ __html: `\\((A \\cap B) \\cap C = A \\cap (B \\cap C)\\)` }} /></p>
                    </div>
                  </div>
                </div>
                <p className="text-neutral-300 text-sm">
                  <strong>Meaning:</strong> Grouping doesn't matter when combining multiple sets with the same operation. 
                  We can write <span dangerouslySetInnerHTML={{ __html: `\\(A \\cup B \\cup C\\)` }} /> and <span dangerouslySetInnerHTML={{ __html: `\\(A \\cap B \\cap C\\)` }} /> without parentheses.
                </p>
              </div>
            </div>
            
            <div className="bg-purple-900/20 p-5 rounded-lg border border-purple-600/30">
              <h5 className="font-semibold text-purple-400 mb-3 text-lg">🔄 Distributive Laws</h5>
              <div className="space-y-3">
                <div className="bg-neutral-800/50 p-4 rounded">
                  <div className="space-y-3">
                    <div>
                      <p className="text-neutral-200 font-medium mb-2">Union distributes over intersection:</p>
                      <p className="text-center"><span dangerouslySetInnerHTML={{ __html: `\\(A \\cup (B \\cap C) = (A \\cup B) \\cap (A \\cup C)\\)` }} /></p>
                    </div>
                    <div>
                      <p className="text-neutral-200 font-medium mb-2">Intersection distributes over union:</p>
                      <p className="text-center"><span dangerouslySetInnerHTML={{ __html: `\\(A \\cap (B \\cup C) = (A \\cap B) \\cup (A \\cap C)\\)` }} /></p>
                    </div>
                  </div>
                </div>
                <p className="text-neutral-300 text-sm">
                  <strong>Meaning:</strong> These laws show how to "factor" or "expand" set expressions, 
                  similar to how multiplication distributes over addition in arithmetic.
                </p>
              </div>
            </div>
            
            <div className="bg-orange-900/20 p-5 rounded-lg border border-orange-600/30">
              <h5 className="font-semibold text-orange-400 mb-3 text-lg">🔧 Identity and Complement Laws</h5>
              <div className="space-y-3">
                <div className="bg-neutral-800/50 p-4 rounded">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-200 font-medium mb-2">Identity Laws:</p>
                      <p><span dangerouslySetInnerHTML={{ __html: `\\(A \\cup \\emptyset = A\\)` }} /></p>
                      <p><span dangerouslySetInnerHTML={{ __html: `\\(A \\cap S = A\\)` }} /></p>
                    </div>
                    <div>
                      <p className="text-neutral-200 font-medium mb-2">Domination Laws:</p>
                      <p><span dangerouslySetInnerHTML={{ __html: `\\(A \\cup S = S\\)` }} /></p>
                      <p><span dangerouslySetInnerHTML={{ __html: `\\(A \\cap \\emptyset = \\emptyset\\)` }} /></p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <p className="text-neutral-200 font-medium mb-2">Complement Laws:</p>
                      <p><span dangerouslySetInnerHTML={{ __html: `\\(A \\cup A^c = S\\)` }} /></p>
                      <p><span dangerouslySetInnerHTML={{ __html: `\\(A \\cap A^c = \\emptyset\\)` }} /></p>
                    </div>
                    <div>
                      <p className="text-neutral-200 font-medium mb-2">Involution Law:</p>
                      <p><span dangerouslySetInnerHTML={{ __html: `\\((A^c)^c = A\\)` }} /></p>
                      <p className="text-neutral-400 text-xs mt-1">(Complement of complement is original)</p>
                    </div>
                  </div>
                </div>
                <p className="text-neutral-300 text-sm">
                  <strong>Meaning:</strong> These establish how sets interact with the empty set, universal set, 
                  and complements - the "boundary cases" of set operations.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  },
  {
    id: 'demorgans-laws',
    title: "De Morgan's Laws: The Master Rules",
    content: ({ sectionIndex, isCompleted }) => {
      const contentRef = useMathJax([sectionIndex, isCompleted]);
      
      return (
        <div ref={contentRef} className="space-y-6">
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6 rounded-lg border border-purple-600/30">
            <h4 className="font-semibold text-purple-400 mb-4 text-lg">
              👑 De Morgan's Laws: The Crown Jewels of Logic
            </h4>
            <p className="text-neutral-200 mb-4">
              De Morgan's Laws are arguably the most important rules in all of logic and probability. 
              They reveal the deep relationship between union, intersection, and complementation, 
              and provide the key to simplifying complex logical expressions.
            </p>
            
            <div className="bg-neutral-800/50 p-4 rounded">
              <p className="text-neutral-200 font-semibold mb-2">Named after Augustus De Morgan (1806-1871)</p>
              <p className="text-neutral-300 text-sm">
                British mathematician who formalized these laws, though they were known in various forms 
                for centuries. These laws bridge pure logic, set theory, and probability theory.
              </p>
            </div>
          </div>
          
          <div className="bg-red-900/20 p-6 rounded-lg border border-red-600/30">
            <h5 className="font-semibold text-red-400 mb-4 text-lg">📜 The Two Laws</h5>
            
            <div className="space-y-6">
              <div className="bg-neutral-800/50 p-5 rounded">
                <h6 className="font-semibold text-blue-400 mb-3">First Law: Complement of Union</h6>
                <div className="text-center mb-3">
                  <span className="text-xl" dangerouslySetInnerHTML={{ __html: `\\((A \\cup B)^c = A^c \\cap B^c\\)` }} />
                </div>
                <div className="space-y-3">
                  <div className="bg-blue-900/20 p-3 rounded">
                    <p className="text-blue-300 font-medium mb-2">English Translation:</p>
                    <p className="text-neutral-300 text-sm">
                      "NOT (A OR B)" = "(NOT A) AND (NOT B)"
                    </p>
                  </div>
                  <div className="bg-neutral-700/50 p-3 rounded">
                    <p className="text-neutral-200 font-medium mb-2">Deep Meaning:</p>
                    <p className="text-neutral-300 text-sm">
                      For an outcome to avoid the union of A and B, it must simultaneously avoid A <em>and</em> avoid B. 
                      If it's in either A or B, it's in the union, so to be outside the union, it must be outside both.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-neutral-800/50 p-5 rounded">
                <h6 className="font-semibold text-green-400 mb-3">Second Law: Complement of Intersection</h6>
                <div className="text-center mb-3">
                  <span className="text-xl" dangerouslySetInnerHTML={{ __html: `\\((A \\cap B)^c = A^c \\cup B^c\\)` }} />
                </div>
                <div className="space-y-3">
                  <div className="bg-green-900/20 p-3 rounded">
                    <p className="text-green-300 font-medium mb-2">English Translation:</p>
                    <p className="text-neutral-300 text-sm">
                      "NOT (A AND B)" = "(NOT A) OR (NOT B)"
                    </p>
                  </div>
                  <div className="bg-neutral-700/50 p-3 rounded">
                    <p className="text-neutral-200 font-medium mb-2">Deep Meaning:</p>
                    <p className="text-neutral-300 text-sm">
                      To avoid the intersection of A and B, an outcome just needs to avoid at least one of them. 
                      The intersection requires membership in both, so failing to be in either one is sufficient to avoid the intersection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-cyan-900/20 p-6 rounded-lg border border-cyan-600/30">
            <h5 className="font-semibold text-cyan-400 mb-4 text-lg">🧠 Intuitive Understanding</h5>
            
            <div className="space-y-4">
              <div className="bg-neutral-800/50 p-4 rounded">
                <h6 className="font-semibold text-orange-400 mb-2">First Law Example: Weather</h6>
                <p className="text-neutral-300 text-sm mb-2">
                  "It's not the case that (it's raining OR it's snowing)"
                </p>
                <p className="text-neutral-400 text-xs mb-2">
                  This means: "It's not raining AND it's not snowing"
                </p>
                <p className="text-cyan-300 text-xs">
                  <strong>Logic:</strong> For it to be neither raining nor snowing, both conditions must be false simultaneously.
                </p>
              </div>
              
              <div className="bg-neutral-800/50 p-4 rounded">
                <h6 className="font-semibold text-orange-400 mb-2">Second Law Example: System Status</h6>
                <p className="text-neutral-300 text-sm mb-2">
                  "It's not the case that (database is working AND API is working)"
                </p>
                <p className="text-neutral-400 text-xs mb-2">
                  This means: "Database is not working OR API is not working (or both)"
                </p>
                <p className="text-cyan-300 text-xs">
                  <strong>Logic:</strong> For the system to not be fully operational, at least one component must be failing.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-900/20 p-6 rounded-lg border border-yellow-600/30">
            <h5 className="font-semibold text-yellow-400 mb-4 text-lg">Why These Laws Are Revolutionary</h5>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h6 className="font-semibold text-white mb-3">🔄 Transformation Power</h6>
                <ul className="list-disc list-inside space-y-2 text-sm text-neutral-300 ml-4">
                  <li>Convert complex "NOT" expressions into simpler forms</li>
                  <li>Transform difficult union problems into intersection problems</li>
                  <li>Enable systematic simplification of logical expressions</li>
                  <li>Provide alternative calculation methods for probability</li>
                </ul>
              </div>
              
              <div>
                <h6 className="font-semibold text-white mb-3">🌐 Universal Applications</h6>
                <ul className="list-disc list-inside space-y-2 text-sm text-neutral-300 ml-4">
                  <li>Digital circuit design and Boolean algebra</li>
                  <li>Database query optimization</li>
                  <li>Search algorithms and filtering</li>
                  <li>Probability calculations and Bayesian inference</li>
                  <li>Programming logic and conditional statements</li>
                </ul>
              </div>
            </div>
          </div>
          
          <InterpretationBox theme="purple" title="Mastery Insight">
            <p className="mb-3">
              <strong>The key to mastering De Morgan's Laws:</strong> Remember that they show how negation "flips" operations:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-4">
              <li><strong>NOT (OR)</strong> becomes <strong>AND (NOT)</strong></li>
              <li><strong>NOT (AND)</strong> becomes <strong>OR (NOT)</strong></li>
            </ul>
            <p className="mt-3 text-purple-300 font-medium">
              Once you internalize this pattern, complex logical expressions become as manageable as simple arithmetic.
            </p>
          </InterpretationBox>
        </div>
      );
    }
  }
];

const Tab1FoundationsTab = React.memo(function Tab1FoundationsTab({ onComplete }) {
  return (
    <SectionBasedContent
      title="Foundations"
      description="Building intuition for set operations and De Morgan's laws"
      sections={SECTIONS}
      onComplete={onComplete}
      chapter={1}
      progressVariant="green"
      showHeader={false}
    />
  );
});

export default Tab1FoundationsTab;