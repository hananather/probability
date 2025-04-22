"use client";
/*
  MDX-driven home page for Probability Concepts.
  Imports the MDX file which itself loads content and simulations.
*/
import Probability from "../content/probability.mdx";

export default function Home() {
  // Render the compiled MDX React component
  return <Probability />;
}
