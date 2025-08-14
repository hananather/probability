"use client";

import React from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { Card } from "@/components/ui/card";

const StandardDeviation = () => {
  return (
    <VisualizationContainer
      title="Standard Deviation"
      description="The most common measure of variability"
    >
      <Card className="p-6">
        <p className="text-gray-300">Component content coming soon...</p>
      </Card>
    </VisualizationContainer>
  );
};

export default StandardDeviation;