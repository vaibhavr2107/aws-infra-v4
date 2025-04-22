import React from 'react';
import { cn } from '@/lib/utils';
import { Check, CheckCircle2, Circle, Clock, TerminalSquare } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface StepTrackerProps {
  steps: Step[];
  currentStep: string | null;
  status?: 'pending' | 'in-progress' | 'completed' | 'failed';
}

const StepTracker: React.FC<StepTrackerProps> = ({ steps, currentStep, status = 'pending' }) => {
  if (!steps || steps.length === 0) {
    return <div>No steps defined.</div>;
  }
  
  // Find the index of the current step
  const currentStepIndex = currentStep ? steps.findIndex(step => step.id === currentStep) : -1;
  const isCompleted = status === 'completed';
  
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-lg font-medium mb-4">Provisioning Steps</h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          // Step status
          const stepCompleted = isCompleted || currentStepIndex > index || (isCompleted && currentStep === step.id);
          const isCurrent = !isCompleted && currentStep === step.id;
          const isPending = !stepCompleted && !isCurrent;
          
          // Determine icon
          let icon;
          if (stepCompleted) {
            icon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
          } else if (isCurrent) {
            icon = <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />;
          } else {
            icon = <Clock className="h-5 w-5 text-gray-400" />;
          }
          
          return (
            <div 
              key={step.id}
              className={cn(
                "flex items-start",
                isCompleted && "text-green-700",
                isCurrent && "text-blue-700",
                isPending && "text-gray-500"
              )}
            >
              <div className="flex-shrink-0 mt-1">{icon}</div>
              <div className="ml-3">
                <div className={cn(
                  "text-sm font-medium",
                  isCompleted && "text-green-700",
                  isCurrent && "text-blue-700",
                  isPending && "text-gray-600"
                )}>
                  {step.title}
                </div>
                <div className="mt-0.5 text-xs text-gray-500">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepTracker;