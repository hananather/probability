import { ContentWrapper } from "@/components/shared/ContentWrapper";
import HypothesisTestingGame from "@/components/06-hypothesis-testing/6-1-1-HypothesisTestingGame";
import HypothesisTestingEvidence from "@/components/06-hypothesis-testing/6-1-2-HypothesisTestingEvidence";
import TypeErrorVisualizer from "@/components/06-hypothesis-testing/6-1-3-TypeErrorVisualizer";
import PValueMeaning from "@/components/06-hypothesis-testing/6-1-4-PValueMeaning";

export default function Chapter6() {
  return (
    <ContentWrapper>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Chapter 6: Hypothesis Testing
          </h1>
          <p className="text-gray-400 text-lg">
            Learn the fundamentals of hypothesis testing through interactive games and visualizations.
          </p>
        </div>

        <div className="space-y-12">
          <HypothesisTestingGame />
          <HypothesisTestingEvidence />
          <TypeErrorVisualizer />
          <PValueMeaning />
        </div>
      </div>
    </ContentWrapper>
  );
}