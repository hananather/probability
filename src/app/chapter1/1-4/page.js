"use client";
/*
  MDX-driven page for Chapter 1, Section 1.4: Unordered Samples (Combinations).
  Imports the MDX file which contains all the educational content and components.
*/
import Section14UnorderedSamples from "../../../content/01-introduction-to-probabilities/1-4-unordered-samples.mdx";

export default function Chapter1Section14Page() {
  return (
    <div className="space-y-8">
      <Section14UnorderedSamples />
    </div>
  );
}