"use client";

import React from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { Card } from "@/components/ui/card";

const VarianceIntroduction = () => {
  return (
    <VisualizationContainer
      title="Understanding Variance"
      description="Average squared deviation from the mean"
    >
      <Card className="p-6">
        <p className="text-gray-300">Component content coming soon...</p>
      </Card>
    </VisualizationContainer>
  );
};

export default VarianceIntroduction;