"use client";
/*
  MDX-driven page for Chapter 3: Continuous Random Variables.
  Imports the MDX file which contains all chapter 3 components.
*/
import Chapter3 from "../../content/chapter3.mdx";

export default function Chapter3MDX() {
  return (
    <div className="space-y-8">
      <Chapter3 />
    </div>
  );
}