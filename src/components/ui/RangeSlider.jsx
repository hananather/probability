"use client";

// Simple, reusable range slider component
export function RangeSlider({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 1, 
  step = 0.01,
  showValue = true,
  formatValue = (v) => v,
  className = "",
  id,
  disabled = false
}) {
  return (
    <div className={`flex items-center gap-2 ${className} ${disabled ? 'opacity-50' : ''}`}>
      {label && <label htmlFor={id} className="text-sm text-foreground">{label}:</label>}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? min}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider flex-1"
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        disabled={disabled}
      />
      {showValue && (
        <span className="text-sm min-w-[3rem] text-right text-foreground">
          {formatValue(value ?? min)}
        </span>
      )}
    </div>
  );
}

// Preset configurations for common use cases
export const SliderPresets = {
  probability: {
    min: 0,
    max: 1,
    step: 0.01,
    formatValue: (v) => `${Math.round(v * 100)}%`
  },
  parameter: {
    min: 0.5,
    max: 6,
    step: 0.1,
    formatValue: (v) => v.toFixed(1)
  },
  samples: {
    min: 1,
    max: 100,
    step: 1,
    formatValue: (v) => v
  }
};