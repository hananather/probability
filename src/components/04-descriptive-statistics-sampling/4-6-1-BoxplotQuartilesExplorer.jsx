"use client";
import React from "react";
import BoxplotQuartilesJourney from "./4-6-1-BoxplotQuartilesJourney";
import BoxplotRealWorldExplorer from "./4-6-2-BoxplotRealWorldExplorer";

function BoxplotQuartilesExplorer() {
  return (
    <div className="space-y-8">
      {/* First Component: Step-by-step learning journey */}
      <BoxplotQuartilesJourney />
      
      {/* Second Component: Real-world applications */}
      <BoxplotRealWorldExplorer />
    </div>
  );
}

export default BoxplotQuartilesExplorer;