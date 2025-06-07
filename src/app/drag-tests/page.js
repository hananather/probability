"use client";
import SampleSpacesEventsTest1 from '../../components/01-introduction-to-probabilities/SampleSpacesEventsTest1';
import SampleSpacesEventsTest2 from '../../components/01-introduction-to-probabilities/SampleSpacesEventsTest2';
import SampleSpacesEventsTest3 from '../../components/01-introduction-to-probabilities/SampleSpacesEventsTest3';

export default function DragTestsPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Drag Performance Tests</h1>
      
      <div className="mb-8 p-4 bg-neutral-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Testing Hypotheses for Clunky Dragging</h2>
        <p className="text-gray-300 mb-2">
          The original implementation recreates the entire SVG on every drag event. 
          These tests verify different solutions:
        </p>
        <ul className="list-disc list-inside text-gray-400 space-y-1">
          <li><strong>Test 1:</strong> Updates D3 directly during drag, syncs React only on dragend</li>
          <li><strong>Test 2:</strong> Throttles React updates with requestAnimationFrame</li>
          <li><strong>Test 3:</strong> Removes SVG transforms for direct coordinate handling</li>
        </ul>
      </div>
      
      <div className="space-y-8">
        <SampleSpacesEventsTest1 />
        <SampleSpacesEventsTest2 />
        <SampleSpacesEventsTest3 />
      </div>
      
      <div className="mt-8 p-4 bg-green-900 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Expected Results:</h3>
        <p className="text-green-300">
          If Test 1 is smooth and the others are clunky, it confirms the issue is 
          React re-rendering the entire SVG. This would validate our top hypothesis.
        </p>
      </div>
    </div>
  );
}