"use client";

import React from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { Card } from "@/components/ui/card";

const CoefficientOfVariation = () => {
  return (
    <VisualizationContainer
      title="Coefficient of Variation"
      description="Comparing variability across different scales"
    >
      <Card className="p-6">
        <p className="text-gray-300">Component content coming soon...</p>
      </Card>
    </VisualizationContainer>
  );
};

export default CoefficientOfVariation;