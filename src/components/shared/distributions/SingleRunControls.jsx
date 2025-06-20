import React from 'react';
import { buttonStyles, animations } from '@/utils/distribution-theme';

/**
 * Unified control component for single-run functionality across distributions
 * 
 * @param {Object} props
 * @param {Boolean} props.singleRunMode - Whether single-run mode is active
 * @param {Function} props.onToggleSingleRun - Toggle single-run mode
 * @param {Function} props.onRunSingle - Execute a single run
 * @param {Function} props.onRunMultiple - Execute multiple runs
 * @param {Function} props.onReset - Reset the simulation
 * @param {Boolean} props.isRunning - Whether simulation is currently running
 * @param {Number} props.runCount - Current number of runs completed
 * @param {Number} props.multipleRunCount - Number of runs for batch mode
 * @param {Function} props.onMultipleRunCountChange - Change batch run count
 * @param {Object} props.theme - Distribution theme
 * @param {String} props.singleRunLabel - Custom label for single run button
 * @param {String} props.multipleRunLabel - Custom label for multiple run button
 * @param {Boolean} props.showRunCount - Whether to show run count
 * @param {React.Node} props.additionalControls - Additional control elements
 */
const SingleRunControls = ({
  singleRunMode,
  onToggleSingleRun,
  onRunSingle,
  onRunMultiple,
  onReset,
  isRunning = false,
  runCount = 0,
  multipleRunCount = 100,
  onMultipleRunCountChange,
  theme,
  singleRunLabel = 'Run Single',
  multipleRunLabel = 'Run Multiple',
  showRunCount = true,
  additionalControls = null
}) => {
  const getButtonClass = (type) => {
    const base = buttonStyles.base;
    const themeClass = type === 'primary' 
      ? `bg-gradient-to-r ${theme.gradient} text-white ${theme.hover} shadow-lg ${theme.shadow} hover:shadow-xl hover:scale-105`
      : `bg-neutral-700 border border-neutral-600 text-neutral-300 hover:bg-neutral-600 hover:text-white`;
    const disabled = isRunning ? buttonStyles.disabled : '';
    
    return `${base} ${themeClass} ${disabled}`;
  };
  
  return (
    <div className="single-run-controls space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-neutral-300">
            Simulation Mode:
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleSingleRun(true)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                ${singleRunMode 
                  ? `bg-gradient-to-r ${theme.gradient} text-white shadow-md` 
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'}
              `}
              disabled={isRunning}
            >
              Step-by-Step
            </button>
            <button
              onClick={() => onToggleSingleRun(false)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                ${!singleRunMode 
                  ? `bg-gradient-to-r ${theme.gradient} text-white shadow-md` 
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'}
              `}
              disabled={isRunning}
            >
              Batch Mode
            </button>
          </div>
        </div>
        
        {showRunCount && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">Runs:</span>
            <span className={`
              font-mono text-lg font-semibold
              ${theme.primary ? `text-[${theme.primary}]` : 'text-teal-400'}
              ${runCount > 0 ? 'animate-pulse' : ''}
            `}>
              {runCount}
            </span>
          </div>
        )}
      </div>
      
      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3">
        {singleRunMode ? (
          <button
            onClick={onRunSingle}
            disabled={isRunning}
            className={getButtonClass('primary')}
            style={{
              animation: isRunning ? animations.keyframes.pulse : 'none'
            }}
          >
            <span className="flex items-center gap-2">
              {isRunning ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {singleRunLabel}
                </>
              )}
            </span>
          </button>
        ) : (
          <>
            <button
              onClick={onRunMultiple}
              disabled={isRunning}
              className={getButtonClass('primary')}
            >
              <span className="flex items-center gap-2">
                {isRunning ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Running...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {multipleRunLabel}
                  </>
                )}
              </span>
            </button>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-400">Count:</label>
              <input
                type="number"
                value={multipleRunCount}
                onChange={(e) => onMultipleRunCountChange(parseInt(e.target.value) || 1)}
                className="w-20 px-2 py-2 rounded-md border bg-neutral-800 border-neutral-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                min="1"
                max="10000"
                disabled={isRunning}
              />
            </div>
          </>
        )}
        
        <button
          onClick={onReset}
          disabled={isRunning || runCount === 0}
          className={getButtonClass('secondary')}
        >
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </span>
        </button>
      </div>
      
      {/* Additional Controls */}
      {additionalControls && (
        <div className="additional-controls mt-4 pt-4 border-t border-neutral-700">
          {additionalControls}
        </div>
      )}
      
      {/* Instructions */}
      {singleRunMode && (
        <div className="mt-4 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
          <p className="text-sm text-neutral-300">
            <strong>Step-by-Step Mode:</strong> Click "{singleRunLabel}" to run one trial at a time. 
            Watch how each outcome affects the distribution.
          </p>
        </div>
      )}
    </div>
  );
};

export default SingleRunControls;