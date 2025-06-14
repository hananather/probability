/**
 * Visual Test Harness for Venn Diagram Highlighting
 * 
 * This component provides a visual way to test and verify that the Venn diagram
 * highlighting correctly matches the mathematical set operations.
 */

import React, { useState } from 'react';
import SampleSpacesEvents from '../1-1-1-SampleSpacesEvents';

// Test cases organized by category
const testCases = {
  'Basic Sets': [
    { expression: 'A', expected: '{1, 4, 5, 7}', description: 'Set A only' },
    { expression: 'B', expected: '{2, 5, 6, 7}', description: 'Set B only' },
    { expression: 'C', expected: '{3, 4, 6, 7}', description: 'Set C only' },
    { expression: 'U', expected: '{1, 2, 3, 4, 5, 6, 7, 8}', description: 'Universal set' },
    { expression: '∅', expected: '{}', description: 'Empty set' },
  ],
  'Union Operations': [
    { expression: 'A∪B', expected: '{1, 2, 4, 5, 6, 7}', description: 'Union of A and B' },
    { expression: 'B∪C', expected: '{2, 3, 4, 5, 6, 7}', description: 'Union of B and C' },
    { expression: 'A∪C', expected: '{1, 3, 4, 5, 6, 7}', description: 'Union of A and C' },
    { expression: 'A∪B∪C', expected: '{1, 2, 3, 4, 5, 6, 7}', description: 'Union of all three sets' },
  ],
  'Intersection Operations': [
    { expression: 'A∩B', expected: '{5, 7}', description: 'Intersection of A and B' },
    { expression: 'B∩C', expected: '{6, 7}', description: 'Intersection of B and C' },
    { expression: 'A∩C', expected: '{4, 7}', description: 'Intersection of A and C' },
    { expression: 'A∩B∩C', expected: '{7}', description: 'Intersection of all three sets' },
  ],
  'Complement Operations': [
    { expression: "A'", expected: '{2, 3, 6, 8}', description: 'Complement of A' },
    { expression: "B'", expected: '{1, 3, 4, 8}', description: 'Complement of B' },
    { expression: "C'", expected: '{1, 2, 5, 8}', description: 'Complement of C' },
    { expression: "(A∪B∪C)'", expected: '{8}', description: 'Outside all sets' },
  ],
  'Complex Operations': [
    { expression: '(A∪B)∩C', expected: '{4, 6, 7}', description: 'Union of A and B, then intersect with C' },
    { expression: 'A∪(B∩C)', expected: '{1, 4, 5, 6, 7}', description: 'A union with intersection of B and C' },
    { expression: "(A∩B)'", expected: '{1, 2, 3, 4, 6, 8}', description: 'Complement of A∩B' },
    { expression: "A'∩B'", expected: '{3, 8}', description: 'Intersection of complements' },
  ],
  'De Morgan\'s Laws': [
    { expression: "(A∪B)'", expected: '{3, 8}', description: 'Complement of union' },
    { expression: "A'∩B'", expected: '{3, 8}', description: 'Should equal (A∪B)\'' },
    { expression: "(A∩B)'", expected: '{1, 2, 3, 4, 6, 8}', description: 'Complement of intersection' },
    { expression: "A'∪B'", expected: '{1, 2, 3, 4, 6, 8}', description: 'Should equal (A∩B)\'' },
  ],
  'Edge Cases': [
    { expression: '∅∪A', expected: '{1, 4, 5, 7}', description: 'Empty set union A equals A' },
    { expression: '∅∩A', expected: '{}', description: 'Empty set intersect A equals empty' },
    { expression: 'U∩A', expected: '{1, 4, 5, 7}', description: 'Universal intersect A equals A' },
    { expression: 'U∪A', expected: '{1, 2, 3, 4, 5, 6, 7, 8}', description: 'Universal union A equals U' },
  ],
};

// Region definitions for visual verification
const regions = {
  'Region 1': { elements: [1], description: 'Only in A', color: 'blue' },
  'Region 2': { elements: [2], description: 'Only in B', color: 'green' },
  'Region 3': { elements: [3], description: 'Only in C', color: 'red' },
  'Region 4': { elements: [4], description: 'A∩C only', color: 'purple' },
  'Region 5': { elements: [5], description: 'A∩B only', color: 'cyan' },
  'Region 6': { elements: [6], description: 'B∩C only', color: 'yellow' },
  'Region 7': { elements: [7], description: 'A∩B∩C', color: 'white' },
  'Region 8': { elements: [8], description: 'Outside all', color: 'gray' },
};

function VennDiagramTestHarness() {
  const [selectedCategory, setSelectedCategory] = useState('Basic Sets');
  const [currentTest, setCurrentTest] = useState(null);
  const [showRegions, setShowRegions] = useState(false);

  const runTest = (testCase) => {
    setCurrentTest(testCase);
    // In a real test environment, we would programmatically input the expression
    // and verify the result
    console.log(`Running test: ${testCase.expression}`);
    console.log(`Expected: ${testCase.expected}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Venn Diagram Test Harness</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3">Test Categories</h2>
              <div className="space-y-2">
                {Object.keys(testCases).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3">Test Cases</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testCases[selectedCategory].map((testCase, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 rounded p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => runTest(testCase)}
                  >
                    <div className="font-mono text-yellow-400">{testCase.expression}</div>
                    <div className="text-sm text-gray-300">{testCase.description}</div>
                    <div className="text-xs text-green-400 mt-1">Expected: {testCase.expected}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Region Reference */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3">Region Reference</h2>
              <button
                onClick={() => setShowRegions(!showRegions)}
                className="mb-3 px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700"
              >
                {showRegions ? 'Hide' : 'Show'} Regions
              </button>
              {showRegions && (
                <div className="space-y-2">
                  {Object.entries(regions).map(([name, region]) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span>{name}: {region.description}</span>
                      <span className="font-mono">{region.elements.join(', ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Venn Diagram Component */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3">Visual Test</h2>
              {currentTest && (
                <div className="mb-4 p-3 bg-gray-700 rounded">
                  <div className="text-lg font-mono text-yellow-400">{currentTest.expression}</div>
                  <div className="text-sm text-gray-300">{currentTest.description}</div>
                  <div className="text-sm text-green-400">Expected: {currentTest.expected}</div>
                </div>
              )}
              <div className="border-2 border-gray-600 rounded">
                <SampleSpacesEvents />
              </div>
            </div>

            {/* Test Instructions */}
            <div className="mt-4 bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Testing Instructions</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                <li>Select a test category from the left panel</li>
                <li>Click on a test case to see the expected result</li>
                <li>Enter the expression in the Venn diagram component</li>
                <li>Verify that the highlighted regions match the expected elements</li>
                <li>Use the Region Reference to identify which areas should be highlighted</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VennDiagramTestHarness;