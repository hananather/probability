"use client";
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { WorkedExample, ExampleSection, Formula, InsightBox, CalculationSteps, RealWorldExample, Step } from '../ui/WorkedExample';
import { VisualizationContainer, VisualizationSection, ControlPanel, GraphContainer, StatsDisplay, ControlGroup } from '../ui/VisualizationContainer';
import MathJaxSection from '../ui/MathJaxSection';
import { QuizBreak, MultipleChoiceQuestion } from '../mdx/QuizBreak';
import BackToHub from '../ui/BackToHub';
import { RangeSlider } from '../ui/RangeSlider';
import { ProgressBar } from '../ui/ProgressBar';
import { ChevronDown, ChevronUp, Code, Eye, Palette, Layout, MousePointer, Calculator, BarChart3, BookOpen } from 'lucide-react';

// Component categories for organization
const componentCategories = {
  layout: {
    name: 'Layout & Containers',
    icon: Layout,
    color: 'text-blue-400',
    components: [
      {
        name: 'VisualizationContainer',
        file: '/src/components/ui/VisualizationContainer.jsx',
        description: 'Main container for visualizations with optional tutorial integration',
        component: VisualizationContainer,
        props: { title: 'Sample Visualization', children: <div className="bg-neutral-800 p-4 rounded">Content goes here</div> }
      },
      {
        name: 'VisualizationSection',
        file: '/src/components/ui/VisualizationContainer.jsx',
        description: 'Section within visualization containers',
        component: VisualizationSection,
        props: { title: 'Section Title', children: <p className="text-neutral-300">Section content</p> }
      },
      {
        name: 'GraphContainer',
        file: '/src/components/ui/VisualizationContainer.jsx',
        description: 'Container specifically for charts and graphs',
        component: GraphContainer,
        props: { children: <div className="bg-neutral-900 border border-neutral-700 rounded p-8 text-center text-neutral-400">Graph Area (400px height)</div> }
      },
      {
        name: 'ControlPanel',
        file: '/src/components/ui/VisualizationContainer.jsx',
        description: 'Panel for input controls and settings',
        component: ControlPanel,
        props: { children: <div className="space-y-2"><Button variant="neutral" size="sm">Control 1</Button><Button variant="neutral" size="sm">Control 2</Button></div> }
      }
    ]
  },
  content: {
    name: 'Content & Examples',
    icon: BookOpen,
    color: 'text-green-400',
    components: [
      {
        name: 'WorkedExample',
        file: '/src/components/ui/WorkedExample.jsx',
        description: 'Standardized container for worked examples with variants',
        component: () => (
          <div className="space-y-4">
            <WorkedExample title="Default Variant" variant="default">
              <p>This is the default styling variant</p>
            </WorkedExample>
            <WorkedExample title="Compact Variant" variant="compact">
              <p>This is the compact styling variant</p>
            </WorkedExample>
            <WorkedExample title="Highlight Variant" variant="highlight">
              <p>This is the highlighted styling variant with yellow accent</p>
            </WorkedExample>
          </div>
        ),
        props: {}
      },
      {
        name: 'ExampleSection',
        file: '/src/components/ui/WorkedExample.jsx',
        description: 'Section within worked examples',
        component: ExampleSection,
        props: { title: 'Step 1', children: <p>First step of the solution</p> }
      },
      {
        name: 'InsightBox',
        file: '/src/components/ui/WorkedExample.jsx',
        description: 'Highlighted insight or note boxes with variants',
        component: () => (
          <div className="space-y-3">
            <InsightBox variant="default" icon="💡">Default: Regular insight box</InsightBox>
            <InsightBox variant="info" icon="ℹ️">Info: Blue information box</InsightBox>
            <InsightBox variant="warning" icon="⚠️">Warning: Amber warning box</InsightBox>
            <InsightBox variant="success" icon="✅">Success: Green success box</InsightBox>
            <InsightBox variant="error" icon="❌">Error: Red error box</InsightBox>
          </div>
        ),
        props: {}
      },
      {
        name: 'RealWorldExample',
        file: '/src/components/ui/WorkedExample.jsx',
        description: 'Container for real-world application examples',
        component: RealWorldExample,
        props: { children: 'In manufacturing, this concept helps optimize quality control processes.' }
      },
      {
        name: 'Step',
        file: '/src/components/ui/WorkedExample.jsx',
        description: 'Numbered step component for sequential processes',
        component: Step,
        props: { number: 1, description: 'Calculate the mean', children: <p>First, find the average of all values...</p> }
      }
    ]
  },
  interactive: {
    name: 'Interactive Elements',
    icon: MousePointer,
    color: 'text-purple-400',
    components: [
      {
        name: 'Button',
        file: '/src/components/ui/button.jsx',
        description: 'Styled button with multiple variants',
        component: ({ variant = 'primary' }) => (
          <div className="flex gap-2 flex-wrap">
            <Button variant="primary" size="sm">Primary</Button>
            <Button variant="neutral" size="sm">Neutral</Button>
            <Button variant="success" size="sm">Success</Button>
            <Button variant="danger" size="sm">Danger</Button>
          </div>
        ),
        props: {}
      },
      {
        name: 'RangeSlider',
        file: '/src/components/ui/RangeSlider.jsx',
        description: 'Customizable range input slider',
        component: () => {
          const [value, setValue] = useState(50);
          return <RangeSlider min={0} max={100} value={value} onChange={setValue} label="Sample Value" />;
        },
        props: {}
      },
      {
        name: 'QuizBreak',
        file: '/src/components/mdx/QuizBreak.jsx',
        description: 'Interactive quiz component with feedback',
        component: () => (
          <QuizBreak
            question="What is 2 + 2?"
            options={["3", "4", "5", "6"]}
            correct={1}
            onComplete={() => {}}
          />
        ),
        props: {}
      }
    ]
  },
  mathematical: {
    name: 'Mathematical Components',
    icon: Calculator,
    color: 'text-yellow-400',
    components: [
      {
        name: 'MathJaxSection',
        file: '/src/components/ui/MathJaxSection.jsx',
        description: 'Wrapper for proper MathJax rendering',
        component: MathJaxSection,
        props: { 
          children: <div className="text-center py-4">
            <span dangerouslySetInnerHTML={{ __html: `\\[f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}\\]` }} />
          </div>
        }
      },
      {
        name: 'Formula',
        file: '/src/components/ui/WorkedExample.jsx',
        description: 'Container for mathematical formulas',
        component: Formula,
        props: { 
          children: <div className="text-center text-teal-400">
            <span dangerouslySetInnerHTML={{ __html: `\\[r = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i - \\bar{x})^2 \\sum(y_i - \\bar{y})^2}}\\]` }} />
          </div>
        }
      },
      {
        name: 'CalculationSteps',
        file: '/src/components/ui/WorkedExample.jsx',
        description: 'Sequential calculation display',
        component: CalculationSteps,
        props: { 
          steps: [
            { label: 'Step 1', content: '\\[\\bar{x} = \\frac{1}{n}\\sum x_i = 5.2\\]', explanation: 'Calculate the mean' },
            { label: 'Step 2', content: '\\[s^2 = \\frac{\\sum(x_i - \\bar{x})^2}{n-1} = 2.4\\]', explanation: 'Calculate variance' }
          ]
        }
      }
    ]
  },
  utility: {
    name: 'Utility Components',
    icon: BarChart3,
    color: 'text-orange-400',
    components: [
      {
        name: 'ProgressBar',
        file: '/src/components/ui/ProgressBar.jsx',
        description: 'Progress indicator with customizable styling',
        component: () => <ProgressBar progress={75} className="w-full" />,
        props: {}
      },
      {
        name: 'StatsDisplay',
        file: '/src/components/ui/VisualizationContainer.jsx',
        description: 'Grid display for statistical values',
        component: StatsDisplay,
        props: { 
          stats: [
            { label: 'Mean', value: '5.24', highlight: false },
            { label: 'Std Dev', value: '1.87', highlight: true },
            { label: 'Count', value: '100', highlight: false },
            { label: 'R²', value: '0.842', highlight: true }
          ]
        }
      },
      {
        name: 'ControlGroup',
        file: '/src/components/ui/VisualizationContainer.jsx',
        description: 'Grouped input controls with labels',
        component: ControlGroup,
        props: { 
          label: 'Distribution Parameters',
          children: (
            <div className="space-y-2">
              <input className="bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-white text-sm" placeholder="Mean" />
              <input className="bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-white text-sm" placeholder="Std Dev" />
            </div>
          )
        }
      },
      {
        name: 'BackToHub',
        file: '/src/components/ui/BackToHub.jsx',
        description: 'Navigation button back to chapter hub',
        component: BackToHub,
        props: { href: '/chapter7', chapterTitle: 'Chapter 7' }
      }
    ]
  }
};

// Component showcase item
function ComponentShowcase({ name, file, description, component: Component, props }) {
  const [showCode, setShowCode] = useState(false);
  const [showExample, setShowExample] = useState(true);

  const importStatement = `import { ${name} } from '${file.replace('/src/components/', '@/components/')}';`;
  
  return (
    <div className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-700">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-white">{name}</h4>
            <p className="text-sm text-neutral-400 mt-1">{description}</p>
            <p className="text-xs text-neutral-500 mt-1 font-mono">{file}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="neutral"
              size="xs"
              onClick={() => setShowExample(!showExample)}
              className="flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              {showExample ? 'Hide' : 'Show'}
            </Button>
            <Button
              variant="neutral"
              size="xs"
              onClick={() => setShowCode(!showCode)}
              className="flex items-center gap-1"
            >
              <Code className="w-3 h-3" />
              Code
            </Button>
          </div>
        </div>
      </div>

      {/* Example */}
      {showExample && (
        <div className="p-4 border-b border-neutral-700 bg-neutral-900/50">
          <h5 className="text-sm font-medium text-neutral-300 mb-3">Live Example:</h5>
          <div className="bg-neutral-900 rounded border border-neutral-600 p-4">
            <Component {...props} />
          </div>
        </div>
      )}

      {/* Code */}
      {showCode && (
        <div className="p-4 bg-neutral-950">
          <h5 className="text-sm font-medium text-neutral-300 mb-3">Usage:</h5>
          <div className="bg-neutral-900 rounded border border-neutral-700 p-3 text-xs font-mono text-green-400">
            <div className="text-neutral-500 mb-2">// Import</div>
            <div className="mb-3">{importStatement}</div>
            <div className="text-neutral-500 mb-2">// Basic Usage</div>
            <div>{`<${name} ${Object.keys(props).length > 0 ? '...' : ''}/>`}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Category section
function CategorySection({ category, data, isExpanded, onToggle }) {
  const IconComponent = data.icon;
  
  return (
    <div className="space-y-4">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:bg-neutral-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <IconComponent className={`w-5 h-5 ${data.color}`} />
          <h3 className="text-lg font-semibold text-white">{data.name}</h3>
          <span className="text-sm text-neutral-400">({data.components.length} components)</span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-neutral-400" /> : <ChevronDown className="w-5 h-5 text-neutral-400" />}
      </button>

      {/* Components Grid */}
      {isExpanded && (
        <div className="grid gap-6">
          {data.components.map((comp, index) => (
            <ComponentShowcase key={index} {...comp} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ComponentLibrary() {
  const [expandedCategories, setExpandedCategories] = useState({
    layout: true,
    content: false,
    interactive: false,
    mathematical: false,
    utility: false
  });
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredCategories = Object.entries(componentCategories).map(([key, data]) => ({
    key,
    data: {
      ...data,
      components: data.components.filter(comp => 
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
  })).filter(({ data }) => data.components.length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Component Library</h1>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          Visual catalog of all available UI components in your probability lab. 
          Browse, explore, and see live examples of every component you can use.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(componentCategories).map(([key, data]) => {
          const IconComponent = data.icon;
          return (
            <div key={key} className="bg-neutral-800 rounded-lg p-4 text-center border border-neutral-700">
              <IconComponent className={`w-6 h-6 ${data.color} mx-auto mb-2`} />
              <div className="text-lg font-semibold text-white">{data.components.length}</div>
              <div className="text-xs text-neutral-400">{data.name}</div>
            </div>
          );
        })}
      </div>

      {/* Component Categories */}
      <div className="space-y-6">
        {filteredCategories.map(({ key, data }) => (
          <CategorySection
            key={key}
            category={key}
            data={data}
            isExpanded={expandedCategories[key]}
            onToggle={() => toggleCategory(key)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 p-6 bg-blue-900/20 border border-blue-600/30 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">💡 How to Use This Library</h3>
        <ul className="space-y-2 text-sm text-neutral-300">
          <li>• <strong>Browse:</strong> Expand categories to see available components</li>
          <li>• <strong>Explore:</strong> Click "Show" to see live examples of each component</li>
          <li>• <strong>Code:</strong> Click "Code" to see import statements and basic usage</li>
          <li>• <strong>Search:</strong> Use the search box to quickly find specific components</li>
          <li>• <strong>Reference:</strong> File paths show exactly where each component lives</li>
        </ul>
      </div>
    </div>
  );
}