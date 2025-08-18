"use client";
import React, { useEffect, useRef } from 'react';
import { cn } from '../../../lib/design-system';
import { VisualizationSection } from '../VisualizationContainer';

/**
 * ComparisonTable - Extracted from Chapter 7.4 CI vs PI Comparison
 * 
 * Creates beautiful comparison tables with proper MathJax rendering.
 * Based on the exact pattern used in the Comprehensive CI vs PI Comparison.
 * 
 * @param {Object} props
 * @param {string} props.title - Table title
 * @param {Array} props.columns - Column definitions [{ key, title, color }]
 * @param {Array} props.rows - Row data with aspect and column data
 * @param {string} props.className - Additional CSS classes
 */
export function ComparisonTable({ 
  title, 
  columns,
  rows,
  className,
  showAspectColumn = false // Make aspect column optional, default to false
}) {
  const tableRef = useRef(null);
  
  // MathJax processing - exact pattern from Chapter 7.4
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && tableRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([tableRef.current]);
        }
        window.MathJax.typesetPromise([tableRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [rows]);

  return (
    <VisualizationSection className={className}>
      {title && <h3 className="text-xl font-bold text-white mb-4">{title}</h3>}
      <div ref={tableRef} className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-700">
              {showAspectColumn && (
                <th className="text-left py-2 px-3 text-neutral-400">Aspect</th>
              )}
              {columns.map((col, index) => (
                <th key={index} className={cn("text-center py-2 px-3", col.color || "text-white")}>
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex < rows.length - 1 ? "border-b border-neutral-700/50" : ""}>
                {showAspectColumn && (
                  <td className="py-2 px-3 text-neutral-300 font-semibold">
                    <span dangerouslySetInnerHTML={{ __html: row.aspect }} />
                  </td>
                )}
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="text-center py-2 px-3">
                    {typeof row[col.key] === 'string' ? (
                      <span dangerouslySetInnerHTML={{ __html: row[col.key] }} />
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </VisualizationSection>
  );
}

/**
 * createCIPIComparison - Pre-built CI vs PI comparison data
 * Ready to use with ComparisonTable
 */
export const createCIPIComparison = () => ({
  title: "Comprehensive CI vs PI Comparison",
  columns: [
    { key: 'ci', title: 'Confidence Interval (CI)', color: 'text-blue-400' },
    { key: 'pi', title: 'Prediction Interval (PI)', color: 'text-green-400' }
  ],
  rows: [
    {
      aspect: "What it estimates",
      ci: "Mean response \\(E[Y|X=x_0]\\)",
      pi: "Individual observation \\(Y|X=x_0\\)"
    },
    {
      aspect: "Mathematical Formula", 
      ci: "\\(\\hat{y}_0 \\pm t_{\\alpha/2,n-2} \\cdot SE(\\hat{y}_0)\\)",
      pi: "\\(\\hat{y}_0 \\pm t_{\\alpha/2,n-2} \\cdot SE(pred)\\)"
    },
    {
      aspect: "Standard Error",
      ci: "\\(SE(\\hat{y}_0) = \\sqrt{MSE\\left(\\frac{1}{n} + \\frac{(x_0-\\bar{x})^2}{S_{xx}}\\right)}\\)",
      pi: "\\(SE(pred) = \\sqrt{MSE\\left(1 + \\frac{1}{n} + \\frac{(x_0-\\bar{x})^2}{S_{xx}}\\right)}\\)"
    },
    {
      aspect: "Variance Components",
      ci: "\\(\\text{Var}(\\hat{y}_0) = \\sigma^2\\left(\\frac{1}{n} + \\frac{(x_0-\\bar{x})^2}{S_{xx}}\\right)\\)",
      pi: "\\(\\text{Var}(Y_0 - \\hat{y}_0) = \\sigma^2 + \\text{Var}(\\hat{y}_0)\\)"
    },
    {
      aspect: "Width Relationship",
      ci: "Always narrower",
      pi: "Always wider"
    },
    {
      aspect: "Interpretation",
      ci: "\\((1-\\alpha)100\\%\\) confident the true mean response lies in this interval",
      pi: "\\((1-\\alpha)100\\%\\) confident a new observation will fall in this interval"
    },
    {
      aspect: "As \\(n \\to \\infty\\)",
      ci: "Width \\(\\to 0\\)",
      pi: "Width \\(\\to 2t_{\\alpha/2} \\cdot \\sigma\\)"
    },
    {
      aspect: "At \\(x_0 = \\bar{x}\\)",
      ci: "Width = \\(2t_{\\alpha/2,n-2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\)",
      pi: "Width = \\(2t_{\\alpha/2,n-2} \\cdot \\sigma\\sqrt{1 + \\frac{1}{n}}\\)"
    },
    {
      aspect: "Practical Use Cases",
      ci: "• Average performance<br/>• Process control<br/>• Policy decisions<br/>• Group comparisons",
      pi: "• Individual forecasts<br/>• Quality assurance<br/>• Risk assessment<br/>• Warranty limits"
    }
  ]
});

/**
 * SimpleComparisonTable - Simplified version for smaller comparisons
 * 
 * @param {Object} props
 * @param {string} props.title - Table title
 * @param {Array} props.data - Array of comparison objects with aspect, left, right
 * @param {Object} props.headers - { left: "Column 1", right: "Column 2" }
 * @param {Object} props.colors - { left: "text-blue-400", right: "text-green-400" }
 */
export function SimpleComparisonTable({ title, data, headers, colors, className, showAspectColumn = false }) {
  const tableRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && tableRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([tableRef.current]);
        }
        window.MathJax.typesetPromise([tableRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [data]);

  return (
    <div className={cn("bg-neutral-900/50 rounded-lg p-4", className)}>
      {title && <h4 className="font-bold text-white mb-3">{title}</h4>}
      <div ref={tableRef} className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-700">
              {showAspectColumn && (
                <th className="text-left py-2 px-3 text-neutral-400">Aspect</th>
              )}
              <th className={cn("text-center py-2 px-3", colors?.left || "text-blue-400")}>
                {headers?.left || "Option A"}
              </th>
              <th className={cn("text-center py-2 px-3", colors?.right || "text-green-400")}>
                {headers?.right || "Option B"}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={index < data.length - 1 ? "border-b border-neutral-700/50" : ""}>
                {showAspectColumn && (
                  <td className="py-2 px-3 text-neutral-300 font-medium">
                    <span dangerouslySetInnerHTML={{ __html: row.aspect }} />
                  </td>
                )}
                <td className="text-center py-2 px-3">
                  <span dangerouslySetInnerHTML={{ __html: row.left }} />
                </td>
                <td className="text-center py-2 px-3">
                  <span dangerouslySetInnerHTML={{ __html: row.right }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}