import React from "react";
import BayesSimulation from "./BayesSimulation";
import PriorPlot from "./PriorPlot";
import LikelihoodPlot from "./LikelihoodPlot";

const BayesianInference = () => {


  return (
    <div className="space-y-8">
      <PriorPlot />
      <LikelihoodPlot />
      <BayesSimulation
      />
    </div>
  );
};

export default BayesianInference;
