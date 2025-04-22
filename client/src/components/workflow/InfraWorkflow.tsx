import React from "react";
import { CheckCircle2, Clock, TerminalSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface InfraWorkflowProps {
  steps: Step[];
  currentStep: string | null;
  status: "pending" | "in-progress" | "completed" | "failed";
}

const InfraWorkflow: React.FC<InfraWorkflowProps> = ({
  steps,
  currentStep,
  status,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Provisioning Workflow</h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCurrentStep = step.id === currentStep;
          const isPastStep =
            status === "completed" ||
            (steps.findIndex((s) => s.id === currentStep) > index);
          const hasFailed = status === "failed" && isCurrentStep;

          let statusIndicator;
          if (isPastStep) {
            statusIndicator = (
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            );
          } else if (isCurrentStep) {
            if (hasFailed) {
              statusIndicator = (
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-red-100 flex items-center justify-center">
                  <TerminalSquare className="h-5 w-5 text-red-600" />
                </div>
              );
            } else {
              statusIndicator = (
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                </div>
              );
            }
          } else {
            statusIndicator = (
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
            );
          }

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start",
                isCurrentStep && status === "in-progress" && "text-blue-700",
                hasFailed && "text-red-700"
              )}
            >
              {statusIndicator}
              <div className="ml-3">
                <div className="text-sm font-medium">{step.title}</div>
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

export default InfraWorkflow;