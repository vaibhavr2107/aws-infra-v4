import React, { useMemo } from "react";
import { ProvisioningStep, StepStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StepTrackerProps {
  steps: ProvisioningStep[];
  currentStep: string | null;
}

const StepTracker: React.FC<StepTrackerProps> = ({ steps, currentStep }) => {
  // Calculate progress for the connector
  const progressPercentage = useMemo(() => {
    if (!currentStep) return 0;
    
    const totalSteps = steps.length;
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    
    if (currentIndex === -1) return 0;
    
    // If the step is completed, we want to show full progress for that step
    const currentStepStatus = steps[currentIndex].status;
    const completionFactor = currentStepStatus === 'completed' ? 1 : 0.5;
    
    // Calculate percentage - subtract 1 from totalSteps since we're measuring spaces between steps
    return ((currentIndex + completionFactor) / (totalSteps - 1)) * 100;
  }, [steps, currentStep]);
  
  // Helper function for step status classes
  const getStatusClasses = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return {
          icon: "text-white",
          circle: "bg-success border-success",
          badge: "bg-success-light text-success",
          text: ""
        };
      case 'in-progress':
        return {
          icon: "text-aws-blue",
          circle: "bg-white border-aws-blue",
          badge: "bg-aws-light-blue text-aws-blue",
          text: ""
        };
      case 'failed':
        return {
          icon: "text-white",
          circle: "bg-error border-error",
          badge: "bg-error-light text-error",
          text: ""
        };
      default:
        return {
          icon: "text-gray-400",
          circle: "bg-white border-gray-200",
          badge: "bg-gray-100 text-gray-800",
          text: "text-gray-400"
        };
    }
  };
  
  // Get icon component based on name
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'lock':
        return <i className="ri-lock-line text-lg"></i>;
      case 'globe':
        return <i className="ri-global-line text-lg"></i>;
      case 'layout-grid':
        return <i className="ri-layout-grid-line text-lg"></i>;
      case 'file-text':
        return <i className="ri-file-list-3-line text-lg"></i>;
      case 'settings':
        return <i className="ri-settings-line text-lg"></i>;
      case 'rocket':
        return <i className="ri-rocket-line text-lg"></i>;
      default:
        return <i className="ri-checkbox-circle-line text-lg"></i>;
    }
  };
  
  // Get status text
  const getStatusText = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Provisioning Steps</h2>
      
      <div className="relative">
        {/* Background connector line */}
        <div className="step-connector"></div>
        
        {/* Progress connector line */}
        <div 
          className="step-connector-filled" 
          style={{ height: `${progressPercentage}%` }}
        ></div>
        
        {/* Steps */}
        {steps.map((step, index) => {
          const classes = getStatusClasses(step.status);
          
          return (
            <div 
              key={step.id}
              className={cn(
                "relative z-10 flex items-start", 
                index < steps.length - 1 ? "mb-8" : ""
              )}
              data-step={step.id}
            >
              <div className={cn(
                "flex-shrink-0 h-10 w-10 rounded-full border-2 flex items-center justify-center",
                classes.circle
              )}>
                <span className={classes.icon}>
                  {getIcon(step.icon)}
                </span>
              </div>
              
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                <span className={cn(
                  "mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  classes.badge
                )}>
                  {getStatusText(step.status)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepTracker;
