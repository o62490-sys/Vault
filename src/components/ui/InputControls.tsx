
import React from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <input 
        id={id}
        type="checkbox" 
        checked={checked} 
        onChange={e => onChange(e.target.checked)} 
        className="custom-checkbox"
      />
      <label htmlFor={id} className="ml-3 block text-sm text-text-primary">
        {label}
      </label>
    </div>
  );
}

interface SliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
}

export function Slider({ label, value, onChange, min, max }: SliderProps) {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-text-primary">{label}</label>
                <span className="text-primary font-semibold text-lg bg-surface px-2 rounded">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={e => onChange(parseInt(e.target.value, 10))}
                className="custom-slider"
            />
        </div>
    );
}