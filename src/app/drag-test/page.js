"use client";
import DragTest from "../../components/DragTest";
import DistributionSimulationLarge from "../../components/DistributionSimulationLarge";

export default function DragTestPage() {
  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', padding: '1rem' }}>Drag Behavior Test</h1>
      <DragTest />
      <hr style={{ margin: '2rem 0', borderColor: '#333' }} />
      <DistributionSimulationLarge />
    </div>
  );
}