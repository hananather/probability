"use client";
import dynamic from 'next/dynamic';
/*
  MDX-driven home page for Probability Concepts.
  Imports the MDX file which itself loads content and simulations.
*/
const Probability = dynamic(() => import("../content/probability.mdx"), { ssr: false });

export default function Home() {
  return (
    <div className="space-y-8">
      <Probability />
    </div>
  );
}
