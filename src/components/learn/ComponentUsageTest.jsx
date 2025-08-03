"use client";
import React from 'react';

// Test imports to see what works easily
import { SemanticGradientCard, SemanticGradientGrid } from '../ui/patterns/SemanticGradientCard';
import { InterpretationBox } from '../ui/patterns/InterpretationBox';
import { SideBySideFormulas, createCorrelationSideBySide } from '../ui/patterns/SideBySideFormulas';
import { SimpleFormulaCard, SimpleInsightBox, SimpleFormulaGrid, SimpleCalculationBox, commonFormulas } from '../ui/patterns/SimpleComponents';

/**
 * ComponentUsageTest - Simple test to verify components work easily
 */
export function ComponentUsageTest() {
  const correlationData = createCorrelationSideBySide();

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-white">Component Usage Test</h1>
      
      {/* Test 1: Simple Semantic Card */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Test 1: Simple Card</h2>
        <SemanticGradientCard
          title="Test Property"
          description="This is a test:"
          formula={`x = y + z`}
          note="Simple test formula"
          theme="teal"
        />
      </div>

      {/* Test 2: Grid of Cards */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Test 2: Card Grid</h2>
        <SemanticGradientGrid title="Test Properties" theme="blue">
          <SemanticGradientCard
            title="Property 1"
            formula={`a = b + c`}
            theme="blue"
          />
          <SemanticGradientCard
            title="Property 2"
            formula={`x = y \\cdot z`}
            theme="green"
          />
        </SemanticGradientGrid>
      </div>

      {/* Test 3: Interpretation Box */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Test 3: Interpretation</h2>
        <InterpretationBox title="Test Result" theme="teal">
          <p>With <span dangerouslySetInnerHTML={{ __html: `\\(r = 0.85\\)` }} />, we have a strong relationship.</p>
        </InterpretationBox>
      </div>

      {/* Test 4: Side-by-Side Formulas */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Test 4: Formula Comparison</h2>
        <SideBySideFormulas
          title={correlationData.title}
          formulas={correlationData.formulas}
          defaultExpanded={true}
          theme="purple"
        />
      </div>

      {/* Test 5: Custom Formula Comparison */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Test 5: Custom Formulas</h2>
        <SideBySideFormulas
          title="Custom Test Formulas"
          formulas={[
            {
              title: "Simple",
              latex: `\\[y = mx + b\\]`,
              description: "Linear equation"
            },
            {
              title: "Complex",
              latex: `\\[y = ax^2 + bx + c\\]`,
              description: "Quadratic equation"
            }
          ]}
          defaultExpanded={true}
          theme="green"
        />
      </div>

      {/* Test 6: SUPER SIMPLE Components */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">🚀 Test 6: Ultra-Simple Components</h2>
        
        <div className="space-y-4">
          {/* Single formula card */}
          <SimpleFormulaCard
            title="Sample Mean"
            formula={commonFormulas.mean}
            description="The average of all sample values"
            theme="teal"
          />

          {/* Simple insight box */}
          <SimpleInsightBox title="Key Result" theme="green">
            <p>With <span dangerouslySetInnerHTML={{ __html: `\\(p < 0.05\\)` }} />, we reject the null hypothesis.</p>
          </SimpleInsightBox>

          {/* Grid of common formulas */}
          <SimpleFormulaGrid
            title="Essential Statistics Formulas"
            formulas={[
              {
                title: "Mean",
                formula: commonFormulas.mean,
                description: "Sample average"
              },
              {
                title: "Standard Deviation",
                formula: commonFormulas.standardDev,
                description: "Measure of spread"
              }
            ]}
            theme="purple"
          />

          {/* Single calculation */}
          <SimpleCalculationBox
            title="Step 1: Calculate t-statistic"
            formula={`t = \\frac{2.5 - 0}{0.8/\\sqrt{25}} = 15.625`}
            explanation="Using our sample data with n=25"
          />
        </div>
      </div>
    </div>
  );
}