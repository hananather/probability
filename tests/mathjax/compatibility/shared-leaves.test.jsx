import React, { StrictMode, useEffect, useRef } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { select } from 'd3';
import { WorkedExample, Formula, CalculationSteps } from '@/components/ui/WorkedExample';
import { WorkedExampleContainer } from '@/components/ui/WorkedExampleContainer';
import MathJaxSection from '@/components/ui/MathJaxSection';
import { HypothesisSetup, TestStatistic } from '@/components/ui/patterns/StatisticalTestCard';
import { MultiFormulaDisplay, SimpleFormulaSelector } from '@/components/ui/patterns/MultiFormulaDisplay';
import { ComparisonTable, SimpleComparisonTable } from '@/components/ui/patterns/ComparisonTable';
import { CalculationStep, NestedCalculation, FormulaDisplay } from '@/components/ui/patterns/StepByStepCalculation';
import { QuickReferenceCard } from '@/components/ui/patterns/QuickReferenceCard';
import { SemanticGradientCard, SemanticGradientGrid } from '@/components/ui/patterns/SemanticGradientCard';
import { SideBySideFormulas, StaticFormulaGrid } from '@/components/ui/patterns/SideBySideFormulas';
import { InterpretationBox } from '@/components/ui/patterns/InterpretationBox';
import { createMathJaxRuntime } from '@/lib/mathjax/runtime';
import { useMathJax } from '@/hooks/useMathJax';
import { deferred, renderer, tick } from '../runtime/fixtures';

const shared = vi.hoisted(() => ({ runtime: null }));
vi.mock('@/lib/mathjax/runtime', async importOriginal => ({ ...(await importOriginal()), getMathJaxRuntime: () => shared.runtime }));

const tex = value => `\\[x=${value}\\]`;
const markup = value => <span dangerouslySetInnerHTML={{ __html: tex(value) }} />;
const formulas = value => ({
  first: { name: 'First formula', formula: tex(value), description: 'Definition', notes: 'Same quantity' },
  second: { name: 'Second formula', formula: tex(value + 1), description: 'Equivalent expression', notes: 'Second view' },
});
const gridFormulas = value => [{ title: 'First formula', latex: tex(value) }];
const renderedFormula = (container, value) => [...container.querySelectorAll('mjx-container')].find(node => node.dataset.source === tex(value) || node.dataset.source === `\\(x=${value}\\)`);

// Mutating only formula leaves simulates MathJax's DOM ownership. This verifies
// queue routing and React updates, rather than TeX parsing or browser layout.
function renderFormulaLeaves(nodes) {
  for (const root of nodes) {
    const leaves = [root, ...root.querySelectorAll('span')];
    for (const leaf of leaves) {
      if (leaf.children.length || !/^\\[[(]/.test(leaf.textContent)) continue;
      const rendered = document.createElement('mjx-container');
      rendered.dataset.source = leaf.textContent;
      rendered.textContent = 'Rendered mathematics';
      leaf.replaceChildren(rendered);
    }
  }
  return Promise.resolve();
}

const leaves = [
  ['worked example children', value => <WorkedExample title="Example">{markup(value)}</WorkedExample>],
  ['worked formula', value => <Formula latex={`x=${value}`} />],
  ['calculation list', value => <CalculationSteps steps={[{ label: 'Calculate', content: tex(value) }]} />],
  ['math section children', value => <MathJaxSection>{markup(value)}</MathJaxSection>],
  ['hypothesis setup', value => <HypothesisSetup nullHypothesis={`x=${value}`} alternativeHypothesis="x>0" />],
  ['test statistic', value => <TestStatistic formula="x=0" calculation={`x=${value}`} />],
  ['formula display selected prop', value => <MultiFormulaDisplay title="Formula views" formulas={formulas(value)} />],
  ['simple formula selected prop', value => <SimpleFormulaSelector formulas={formulas(value)} />],
  ['comparison rows', value => <ComparisonTable title="Compare" columns={[{ key: 'value', title: 'Value' }]} rows={[{ aspect: 'Event', value: tex(value) }]} showAspectColumn />],
  ['simple comparison rows', value => <SimpleComparisonTable title="Compare" data={[{ aspect: 'Event', left: tex(value), right: 'Other' }]} showAspectColumn />],
  ['calculation step', value => <CalculationStep number={1} title="Calculate">{markup(value)}</CalculationStep>],
  ['nested calculation', value => <NestedCalculation label="Calculate">{markup(value)}</NestedCalculation>],
  ['formula region', value => <FormulaDisplay formula={`x=${value}`} />],
  ['reference sections', value => <QuickReferenceCard mode="embedded" sections={[{ title: 'Reference', formula: tex(value) }]} />],
  ['semantic formula', value => <SemanticGradientCard title="Formula" formula={tex(value)} />],
  ['semantic grid children', value => <SemanticGradientGrid title="Views">{markup(value)}</SemanticGradientGrid>],
  ['expanded comparison prop', value => <SideBySideFormulas title="Compare formulas" formulas={gridFormulas(value)} defaultExpanded />],
  ['static grid prop', value => <StaticFormulaGrid title="Formula grid" formulas={gridFormulas(value)} />],
  ['interpretation children', value => <InterpretationBox>{markup(value)}</InterpretationBox>],
];

describe('shared mathematics leaves through the canonical runtime', () => {
  let mathJax;
  let load;
  beforeEach(() => {
    vi.useFakeTimers();
    mathJax = renderer();
    mathJax.typesetPromise.mockImplementation(renderFormulaLeaves);
    window.MathJax = mathJax;
    load = deferred();
    shared.runtime = createMathJaxRuntime({ loadScript: () => ({ promise: load.promise, remove() {} }) });
  });
  afterEach(async () => {
    cleanup();
    shared.runtime.dispose();
    await tick();
    delete window.MathJax;
    vi.useRealTimers();
  });
  const flush = async () => { await act(async () => { await tick(); }); };

  it.each(leaves)('renders replaced mathematics in the actual %s', async (_name, view) => {
    const { container, rerender } = render(view(1));
    await flush();
    expect(renderedFormula(container, 1)).toBeInTheDocument();
    await flush();
    mathJax.typesetPromise.mockClear();
    rerender(view(2));
    await flush();
    expect(renderedFormula(container, 2)).toBeInTheDocument();
    expect(renderedFormula(container, 1)).toBeUndefined();
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    expect(mathJax.typesetPromise.mock.calls.every(([nodes]) => nodes.length === 1 && nodes[0] instanceof Element)).toBe(true);
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it('waits for actual delayed startup and renders only the current StrictMode formula', async () => {
    const startup = deferred(); mathJax.startup.promise = startup.promise;
    const { container, rerender, unmount } = render(<StrictMode><Formula latex="x=1" /></StrictMode>);
    await flush();
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    rerender(<StrictMode><Formula latex="x=2" /></StrictMode>); await flush();
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    await act(async () => { startup.resolve(); await tick(); });
    expect(container.querySelector('mjx-container')).toHaveAttribute('data-source', tex(2));
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    unmount(); await flush();
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(vi.getTimerCount()).toBe(0);
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it('settles nested lesson renders when runtime notifications arrive without changing mathematics', async () => {
    // Bound a regression before it can exhaust the test process: an unchanged
    // runtime notification must not recreate JSX and enqueue its children again.
    let calls = 0;
    mathJax.typesetPromise.mockImplementation(nodes => {
      calls += 1;
      if (calls > 12) shared.runtime.dispose();
      return renderFormulaLeaves(nodes);
    });
    function Lesson() {
      const ref = useMathJax([]);
      return <div ref={ref}><WorkedExample title="Nested calculation">{markup(1)}</WorkedExample></div>;
    }
    const { container } = render(<Lesson />); await flush();
    await flush();
    const completedCalls = calls;
    expect(completedCalls).toBeLessThanOrEqual(4);
    expect(renderedFormula(container, 1)).toBeInTheDocument();
    await flush();
    expect(calls).toBe(completedCalls);
  });

  it('cancels a reference closed before download startup and restores its native focus', async () => {
    delete window.MathJax;
    const { container } = render(<QuickReferenceCard mode="floating" sections={[{ formula: tex(1) }]} />);
    const toggle = screen.getByRole('button', { name: 'Toggle Quick Reference' });
    fireEvent.click(toggle); await flush();
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Close Quick Reference' }));
    expect(toggle).toHaveFocus();
    window.MathJax = mathJax; await act(async () => { load.resolve(); await tick(); });
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    expect(container.querySelector('mjx-container')).not.toBeInTheDocument();
    fireEvent.click(toggle); await flush();
    expect(container.querySelector('mjx-container')).toHaveAttribute('data-source', tex(1));
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
  });

  it('renders actual formula selections and reopened details without global processing', async () => {
    const { container } = render(<><MultiFormulaDisplay title="Formula views" formulas={formulas(1)} /><SideBySideFormulas title="Comparison details" formulas={gridFormulas(4)} /></>);
    await flush();
    expect(renderedFormula(container, 4)).toBeUndefined();
    fireEvent.click(screen.getByRole('button', { name: 'Second formula' }));
    fireEvent.click(screen.getByRole('button', { name: 'Show Details' })); await flush();
    expect(renderedFormula(container, 2)).toBeInTheDocument();
    expect(renderedFormula(container, 4)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Hide Details' })); await flush();
    fireEvent.click(screen.getByRole('button', { name: 'Show Details' })); await flush();
    expect(renderedFormula(container, 4)).toBeInTheDocument();
    expect(mathJax.typesetPromise.mock.calls.every(([nodes]) => nodes.length === 1)).toBe(true);
  });

  it('renders a changed table column or revealed event without requiring a new row array', async () => {
    const rows = [{ aspect: tex(3), left: tex(1), right: tex(2) }];
    const { container, rerender } = render(<ComparisonTable title="Stable rows" columns={[{ key: 'left', title: 'Left' }]} rows={rows} />);
    await flush();
    expect(renderedFormula(container, 1)).toBeInTheDocument();
    rerender(<ComparisonTable title="Stable rows" columns={[{ key: 'right', title: 'Right' }]} rows={rows} showAspectColumn />);
    await flush();
    expect(renderedFormula(container, 2)).toBeInTheDocument();
    expect(renderedFormula(container, 3)).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map(node => node.textContent)).toEqual(['Aspect', 'Right']);
    expect(screen.getByRole('rowheader')).toContainElement(renderedFormula(container, 3));
  });

  it('renders a changed inline delimiter or note while its main formula is unchanged', async () => {
    const view = (inline, value) => <><Formula latex="x=1" inline={inline} /><SemanticGradientCard formula={tex(4)} note={tex(value)} /></>;
    const { container, rerender } = render(view(false, 2)); await flush();
    expect(renderedFormula(container, 1)).toHaveAttribute('data-source', tex(1));
    rerender(view(true, 3)); await flush();
    expect(renderedFormula(container, 1)).toHaveAttribute('data-source', '\\(x=1\\)');
    expect(renderedFormula(container, 3)).toBeInTheDocument();
    expect(renderedFormula(container, 2)).toBeUndefined();
  });

  it('preserves the worked example debounce and retires its update after unmount', async () => {
    const { container, rerender, unmount } = render(<WorkedExampleContainer>{markup(1)}</WorkedExampleContainer>);
    await flush();
    await act(async () => { await vi.advanceTimersByTimeAsync(150); });
    expect(container.querySelector('mjx-container')).toHaveAttribute('data-source', tex(1));
    mathJax.typesetPromise.mockClear();
    rerender(<WorkedExampleContainer>{markup(2)}</WorkedExampleContainer>);
    expect(screen.getByText('Updating equations...')).toBeInTheDocument();
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    await act(async () => { await vi.advanceTimersByTimeAsync(149); });
    expect(mathJax.typesetPromise).not.toHaveBeenCalled();
    await act(async () => { await vi.advanceTimersByTimeAsync(1); }); await flush();
    expect(container.querySelector('mjx-container')).toHaveAttribute('data-source', tex(2));
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    rerender(<WorkedExampleContainer>{markup(3)}</WorkedExampleContainer>); unmount();
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(mathJax.typesetPromise).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('leaves a D3-owned SVG mounted and updates it alongside section mathematics', async () => {
    function Chart({ value }) {
      const ref = useRef(null);
      useEffect(() => { select(ref.current).selectAll('circle').data([value]).join('circle').attr('cx', d => d).attr('r', 2); }, [value]);
      return <svg ref={ref} aria-label="D3 data plot" />;
    }
    const view = value => <MathJaxSection><Chart value={value} />{markup(value)}</MathJaxSection>;
    const { container, rerender } = render(view(1)); await flush();
    const svg = screen.getByLabelText('D3 data plot');
    expect(svg.querySelector('circle')).toHaveAttribute('cx', '1');
    rerender(view(2)); await flush();
    expect(screen.getByLabelText('D3 data plot')).toBe(svg);
    expect(svg.querySelector('circle')).toHaveAttribute('cx', '2');
    expect(container.querySelector('mjx-container')).toHaveAttribute('data-source', tex(2));
  });
});
