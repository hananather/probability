"use client";
import React, { useEffect } from "react";
import Script from "next/script";

const DataDescriptionWorkedExample = React.memo(function DataDescriptionWorkedExample({
  data = [],
  mean,
  median,
  q1,
  q3,
  iqr,
  outliers = []
}) {
  const n = data.length;
  const meanLatex = `\\bar{x} = \\frac{1}{${n}}\\sum_{i=1}^{${n}} x_i = ${mean?.toFixed(2)}`;
  const medianLatex = `\\tilde{x} = ${median?.toFixed(2)}`;
  const qLatex = `Q_1 = ${q1?.toFixed(2)},\\quad Q_3 = ${q3?.toFixed(2)}\\quad\\Rightarrow\\quad IQR = ${iqr?.toFixed(2)}`;
  const outLatex = `\\text{Outliers: } ${outliers.length}`;

  useEffect(() => {
    if (typeof window !== "undefined" && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [mean, median, q1, q3, iqr, outliers, n]);

  return (
    <>
      <Script
        id="mathjax-data-description"
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
        strategy="afterInteractive"
        onLoad={() => window.MathJax?.typesetPromise()}
      />
      <div
        style={{
          backgroundColor: "#2A303C",
          padding: "1rem",
          borderRadius: "8px",
          color: "#e0e0e0",
          width: "100%",
          maxWidth: "768px",
          margin: "auto",
          marginTop: "1rem",
          overflowX: "auto",
          fontFamily: "var(--font-sans)",
        }}
        className="text-sm"
      >
        <h4
          style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            borderBottom: "1px solid #4A5568",
            paddingBottom: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          Numerical Summary
        </h4>
        <div style={{ marginBottom: "0.75rem" }} dangerouslySetInnerHTML={{ __html: `\\[${meanLatex}\\]` }} />
        <div style={{ marginBottom: "0.75rem" }} dangerouslySetInnerHTML={{ __html: `\\[${medianLatex}\\]` }} />
        <div style={{ marginBottom: "0.75rem" }} dangerouslySetInnerHTML={{ __html: `\\[${qLatex}\\]` }} />
        <div style={{ marginBottom: "0.75rem" }} dangerouslySetInnerHTML={{ __html: `\\[${outLatex}\\]` }} />
      </div>
    </>
  );
});

export default DataDescriptionWorkedExample;
