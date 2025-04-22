import React from 'react';
import { ProvisioningStep } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StepTrackerProps {
  steps: ProvisioningStep[];
  currentStep: string | null;
}

const StepTracker: React.FC<StepTrackerProps> = ({ steps, currentStep }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Provisioning Progress</h3>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.status === 'completed';
            const isFailed = step.status === 'failed';
            const isPending = step.status === 'pending';
            
            return (
              <div key={step.id} className="relative">
                {/* Timeline connector */}
                {index < steps.length - 1 && (
                  <div 
                    className={cn(
                      "absolute left-4 top-8 w-0.5 h-full -ml-px z-0",
                      isCompleted ? "bg-green-500" : "bg-gray-200"
                    )}
                  />
                )}
                
                {/* Step content with icon */}
                <div className="relative z-10 flex items-start">
                  {/* Status indicator */}
                  <div 
                    className={cn(
                      "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full mr-3",
                      isCompleted ? "bg-green-500 text-white" : 
                      isActive ? "bg-blue-500 text-white" :
                      isFailed ? "bg-red-500 text-white" :
                      "bg-gray-200 text-gray-500"
                    )}
                  >
                    {isCompleted ? (
                      <i className="ri-check-line text-lg"></i>
                    ) : isFailed ? (
                      <i className="ri-close-line text-lg"></i>
                    ) : isActive ? (
                      <i className="ri-loader-4-line animate-spin text-lg"></i>
                    ) : (
                      <i className={`ri-${step.icon}-line text-lg`}></i>
                    )}
                  </div>
                  
                  {/* Step details */}
                  <div className={cn(
                    "flex-grow pb-5",
                    isActive ? "opacity-100" : "opacity-80"
                  )}>
                    <h4 className={cn(
                      "font-medium",
                      isActive ? "text-blue-700" :
                      isCompleted ? "text-green-700" :
                      isFailed ? "text-red-700" :
                      "text-gray-700"
                    )}>
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                    
                    {/* Status badge */}
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2",
                      isCompleted ? "bg-green-100 text-green-800" :
                      isActive ? "bg-blue-100 text-blue-800" :
                      isFailed ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    )}>
                      {isCompleted ? "Completed" :
                        isActive ? "In Progress" :
                        isFailed ? "Failed" :
                        "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepTracker;