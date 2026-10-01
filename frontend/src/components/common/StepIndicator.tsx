import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: number;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

export interface StepIndicatorProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  maxAccessibleStep?: number;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  maxAccessibleStep = currentStep,
  className = '',
}) => {
  return (
    <div className={`step-indicator ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;
        const isClickable = onStepClick && step.id <= maxAccessibleStep;
        const isLast = idx === steps.length - 1;

        return (
          <div
            key={step.id}
            className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            onClick={() => {
              if (isClickable) onStepClick(step.id);
            }}
            style={{
              cursor: isClickable ? 'pointer' : 'default',
            }}
          >
            <div className="step-circle">
              {isCompleted ? (
                <Check size={14} strokeWidth={2.5} />
              ) : (
                step.icon || <span>{step.id}</span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="step-title">{step.label}</span>
              {step.sublabel && (
                <span style={{ fontSize: '0.6875rem', color: '#94a3b8', lineHeight: 1 }}>
                  {step.sublabel}
                </span>
              )}
            </div>

            {!isLast && <div className="step-line" />}
          </div>
        );
      })}
    </div>
  );
};
