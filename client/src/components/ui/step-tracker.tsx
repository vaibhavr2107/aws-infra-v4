import React from 'react';
import { ProvisioningStep } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Clock,
  LoaderCircle
} from 'lucide-react';

interface StepTrackerProps {
  steps: ProvisioningStep[];
  currentStep: string | null;
}

const StepTracker: React.FC<StepTrackerProps> = ({ steps, currentStep }) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Provisioning Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {steps.map((step, index) => {
            // Determine the status icon based on the step's status
            let Icon;
            let iconColor;
            let stepColor;
            let lineColor;
            
            switch (step.status) {
              case 'completed':
                Icon = CheckCircle2;
                iconColor = 'text-green-500';
                stepColor = 'text-green-700';
                lineColor = 'bg-green-500';
                break;
              case 'in-progress':
                Icon = LoaderCircle;
                iconColor = 'text-blue-500 animate-spin';
                stepColor = 'text-blue-700';
                lineColor = 'bg-blue-500';
                break;
              case 'failed':
                Icon = AlertCircle;
                iconColor = 'text-red-500';
                stepColor = 'text-red-700';
                lineColor = 'bg-red-500';
                break;
              case 'pending':
              default:
                Icon = Circle;
                iconColor = 'text-gray-300';
                stepColor = 'text-gray-500';
                lineColor = 'bg-gray-200';
                break;
            }
            
            return (
              <li key={step.id} className="relative flex items-start">
                <div className={`flex-shrink-0 h-6 w-6 rounded-full ${iconColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                {/* Line connecting to the next step */}
                {index < steps.length - 1 && (
                  <div 
                    className={`absolute top-6 left-3 w-0.5 h-full -ml-px ${lineColor}`}
                    style={{ height: 'calc(100% - 1.5rem)' }}
                  />
                )}
                
                <div className="ml-4 mt-0.5 min-w-0 flex-1">
                  <h3 className={`text-sm font-medium ${stepColor}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default StepTracker;