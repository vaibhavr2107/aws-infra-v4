import React from "react";
import { useProvisioning } from "@/context/provisioning-context";
import EcsConfigurationForm from "@/components/ecs-configuration-form";
import StepTracker from "@/components/ui/step-tracker";
import ActivityMonitor from "@/components/ui/activity-monitor";
import { validateAwsCredentials, validateEcsConfig } from "@/lib/aws-service-utils";
import { useToast } from "@/hooks/use-toast";

const EcsDashboard: React.FC = () => {
  const { 
    provisioningState, 
    navigateTo, 
    awsCredentials,
    ecsConfig,
    startProvisioningProcess
  } = useProvisioning();
  
  const { toast } = useToast();
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate AWS credentials
    const credentialsError = validateAwsCredentials(awsCredentials);
    if (credentialsError) {
      toast({
        title: "Validation Error",
        description: credentialsError,
        variant: "destructive"
      });
      return;
    }
    
    // Validate ECS config
    const configError = validateEcsConfig(ecsConfig);
    if (configError) {
      toast({
        title: "Validation Error",
        description: configError,
        variant: "destructive"
      });
      return;
    }
    
    // Start provisioning process
    await startProvisioningProcess();
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigateTo('landing')}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <i className="ri-arrow-left-line mr-1"></i>
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">ECS Infrastructure Provisioning</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Configuration Form */}
        <EcsConfigurationForm onSubmit={handleFormSubmit} />
        
        {/* Steps Tracker */}
        <StepTracker 
          steps={provisioningState.steps} 
          currentStep={provisioningState.currentStep}
        />
      </div>
      
      {/* Activity Monitor */}
      <ActivityMonitor 
        logs={provisioningState.logs}
        status={provisioningState.status}
      />
    </div>
  );
};

export default EcsDashboard;
