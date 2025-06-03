"use client";
/*
  MDX-driven home page for Probability Concepts.
  Imports the MDX file which itself loads content and simulations.
*/
import Probability from "../content/probability.mdx";

export default function Home() {
  return (
    <div className="space-y-8">
      <Probability />
    </div>
  );
}
