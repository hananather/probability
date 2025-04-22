import React, { useRef, useState } from 'react';

const CANVAS_SIZE = 500;
const CIRCLE_COLOR = 'rgba(249,115,22,0.3)'; // primary-500 semi-transparent
const DOT_COLOR = 'rgba(249,115,22,1)'; // primary-500
const BORDER_COLOR = '#e5e7eb'; // Tailwind gray-200

function PointEstimation() {
  const canvasRef = useRef(null);
  const [m, setM] = useState(0);
  const [n, setN] = useState(0);

  // Draw initial square and circle
  const drawBase = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    // Draw border
    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    // Draw circle
    ctx.beginPath();
    ctx.fillStyle = CIRCLE_COLOR;
    ctx.arc(CANVAS_SIZE/2, CANVAS_SIZE/2, CANVAS_SIZE/2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  };

  // Draw a single random dot
  const drawDot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const x = Math.random() * CANVAS_SIZE;
    const y = Math.random() * CANVAS_SIZE;
    ctx.beginPath();
    ctx.fillStyle = DOT_COLOR;
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    // Update counts
    // increment total count
    setN(prevN => prevN + 1);
    // increment inside count if inside circle
    const xCircle = CANVAS_SIZE / 2;
    const yCircle = CANVAS_SIZE / 2;
    const rCircle = CANVAS_SIZE / 2;
    const inside = Math.pow(x - xCircle, 2) + Math.pow(y - yCircle, 2) <= Math.pow(rCircle, 2);
    if (inside) setM(prevM => prevM + 1);
  };

  // Drop N dots
  const dropDots = (count, delay) => {
    let dropped = 0;
    function drop() {
      drawDot();
      dropped++;
      if (dropped < count) {
        setTimeout(drop, delay);
      }
    }
    drop();
  };

  // Reset everything
  const handleReset = () => {
    setM(0);
    setN(0);
    drawBase();
  };

  // Draw base when component mounts or resets
  React.useEffect(() => {
    drawBase();
    // eslint-disable-next-line
  }, []);

  // compute π̂ for display
  const piEstimate = n === 0 ? '—' : (4 * m / n).toFixed(4);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start w-full mt-12">
      {/* Left: Text and formulas */}
      <div className="md:w-1/2 w-full">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Point Estimation</h2>
        <p className="mb-4 text-gray-800 dark:text-gray-200">One of the main goals of statistics is to estimate unknown parameters. To approximate these parameters, we choose an estimator, which is simply any function of randomly sampled observations.</p>
        <p className="mb-4 text-gray-800 dark:text-gray-200">To illustrate this idea, we will estimate the value of <span className="font-math text-gray-900 dark:text-white">π</span> by uniformly dropping samples on a square containing an inscribed circle. Notice that the value of <span className="font-math text-gray-900 dark:text-white">π</span> can be expressed as a ratio of areas.</p>
        <div className="mb-4">
          <span className="block font-math text-lg text-gray-900 dark:text-white">S<sub>circle</sub> = πr²</span>
          <span className="block font-math text-lg text-gray-900 dark:text-white">S<sub>square</sub> = 4r²</span>
          <span className="block font-math text-lg text-gray-900 dark:text-white">⇒ π = 4 S<sub>circle</sub> / S<sub>square</sub></span>
        </div>
        <p className="mb-4 text-gray-800 dark:text-gray-200">We can estimate this ratio with our samples. Let <span className="font-math text-gray-900 dark:text-white">m</span> be the number of samples within our circle and <span className="font-math text-gray-900 dark:text-white">n</span> the total number of samples dropped. We define our estimator <span className="font-math text-gray-900 dark:text-white">π̂</span> as:</p>
        <div className="mb-4">
          <span className="block font-math text-lg text-gray-900 dark:text-white">π̂ = 4m/n</span>
        </div>
        <p className="mb-4 text-gray-800 dark:text-gray-200">It can be shown that this estimator has the desirable properties of being <span className="italic">unbiased</span> and <span className="italic">consistent</span>.</p>
        {/* Display values */}
        <div className="flex flex-row gap-6 mb-4">
          <div className="min-w-[80px] text-center">
            <div className="text-xs text-gray-700 dark:text-white">m =</div>
            <div className="font-mono text-lg text-gray-900 dark:text-white" data-testid="m-val">{m}</div>
          </div>
          <div className="min-w-[80px] text-center">
            <div className="text-xs text-gray-700 dark:text-white">n =</div>
            <div className="font-mono text-lg text-gray-900 dark:text-white" data-testid="n-val">{n}</div>
          </div>
          <div className="min-w-[120px] text-center">
            <div className="text-xs text-gray-700 dark:text-white">π̂ =</div>
            <div className="font-mono text-lg" data-testid="pi-val">{piEstimate}</div>
          </div>
        </div>
        {/* Buttons */}
        <div className="controls flex flex-wrap gap-4 items-center mb-4">
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => dropDots(100, 10)}
          >
            Drop 100 Samples
          </button>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => dropDots(1000, 1)}
          >
            Drop 1000 Samples
          </button>
          <button
            className="px-3 py-1 bg-red-600 text-white rounded"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
      {/* Right: Canvas */}
      <div className="md:w-1/2 w-full flex justify-center items-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded"
          aria-label="Drop samples visualization"
        />
      </div>
    </div>
  );
}

export default PointEstimation;
