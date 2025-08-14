"use client";

import React from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { Card } from "@/components/ui/card";

const RangeAndIQR = () => {
  return (
    <VisualizationContainer
      title="Range and Interquartile Range"
      description="Simple measures of data spread"
    >
      <Card className="p-6">
        <p className="text-gray-300">Component content coming soon...</p>
      </Card>
    </VisualizationContainer>
  );
};

export default RangeAndIQR;