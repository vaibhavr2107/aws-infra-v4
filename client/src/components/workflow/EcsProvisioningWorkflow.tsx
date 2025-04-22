import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AwsCredentialsForm from "./AwsCredentialsForm";
import EcsConfigForm from "./EcsConfigForm";
import StepTracker from "@/components/ui/step-tracker";
import ActivityMonitor from "@/components/ui/activity-monitor";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AwsCredentialsRequest, ProvisioningConfig } from "@shared/schema";
import { ProvisioningLog, ProvisioningStep } from "@/lib/types";
import { ecsStepDefinitions } from "./StepDefinitions";
import { validateAwsCredentials, validateEcsConfig } from "@/lib/aws-service-utils";

interface EcsProvisioningWorkflowProps {
  onBack: () => void;
}

/**
 * ECS Provisioning Workflow Component
 * Handles the full workflow for provisioning ECS infrastructure
 */
const EcsProvisioningWorkflow: React.FC<EcsProvisioningWorkflowProps> = ({ onBack }) => {
  const { toast } = useToast();
  
  // State management for the workflow
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed' | 'failed'>('pending');
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [logs, setLogs] = useState<ProvisioningLog[]>([]);
  const [steps, setSteps] = useState<ProvisioningStep[]>(
    ecsStepDefinitions.map(step => ({
      ...step,
      status: 'pending'
    }))
  );
  
  // Form state
  const [credentials, setCredentials] = useState<AwsCredentialsRequest>({
    username: '',
    password: ''
  });
  
  const [config, setConfig] = useState<ProvisioningConfig>({
    applicationName: '',
    environment: 'dev',
    instanceType: 't2.micro',
    containerCount: 1,
    autoScaling: false
  });
  
  // Update credentials
  const handleCredentialsChange = (newCredentials: Partial<AwsCredentialsRequest>) => {
    setCredentials(prev => ({ ...prev, ...newCredentials }));
  };
  
  // Update config
  const handleConfigChange = (newConfig: Partial<ProvisioningConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };
  
  // Start provisioning process
  const startProvisioning = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate credentials
    const credentialsError = validateAwsCredentials(credentials);
    if (credentialsError) {
      toast({
        title: "Validation Error",
        description: credentialsError,
        variant: "destructive"
      });
      return;
    }
    
    // Validate config
    const configError = validateEcsConfig(config);
    if (configError) {
      toast({
        title: "Validation Error",
        description: configError,
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, authenticate with AWS to get credentials
      await apiRequest('/api/aws/credentials', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      
      // Start the provisioning process
      await apiRequest('/api/ecs/provision', {
        method: 'POST',
        body: JSON.stringify({
          credentials,
          config
        })
      });
      
      // Update status
      setStatus('in-progress');
      setCurrentStep('authentication');
      
      // Set initial log
      setLogs([{
        timestamp: new Date().toLocaleTimeString(),
        message: "Starting provisioning process..."
      }]);
      
      // Start polling for status updates
      const intervalId = setInterval(async () => {
        try {
          const response = await apiRequest('/api/ecs/status', {
            method: 'GET'
          });
          
          if (response) {
            setStatus(response.status);
            setCurrentStep(response.currentStep);
            setLogs(response.logs || []);
            
            // Update steps status
            if (response.steps) {
              setSteps(response.steps);
            }
            
            // If provisioning is complete or failed, stop polling
            if (response.status === 'completed' || response.status === 'failed') {
              clearInterval(intervalId);
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error("Error polling provisioning status:", error);
        }
      }, 2000);
      
      // Clear interval on component unmount
      return () => clearInterval(intervalId);
      
    } catch (error) {
      console.error("Error starting provisioning:", error);
      toast({
        title: "Provisioning Error",
        description: "Failed to start provisioning process. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  // Determine if form should be disabled
  const isFormDisabled = isLoading || status === 'in-progress' || status === 'completed';
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          disabled={isLoading || status === 'in-progress'}
        >
          <i className="ri-arrow-left-line mr-1"></i>
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">ECS Infrastructure Provisioning</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="provisioning-form" onSubmit={startProvisioning}>
              {/* AWS Credentials Section */}
              <AwsCredentialsForm 
                credentials={credentials}
                onCredentialsChange={handleCredentialsChange}
                disabled={isFormDisabled}
              />
              
              {/* Application Details Section */}
              <EcsConfigForm 
                config={config}
                onConfigChange={handleConfigChange}
                disabled={isFormDisabled}
              />
              
              <Button
                type="submit"
                disabled={isFormDisabled}
                className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  status === 'completed'
                    ? 'bg-success hover:bg-success/90'
                    : 'bg-aws-blue hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aws-blue`}
              >
                {isLoading || status === 'in-progress' ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Provisioning...
                  </>
                ) : status === 'completed' ? (
                  <>
                    <i className="ri-check-line mr-2"></i>
                    Provisioning Complete
                  </>
                ) : (
                  <>
                    <i className="ri-rocket-line mr-2"></i>
                    Start Provisioning
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Steps Tracker */}
        <StepTracker 
          steps={steps} 
          currentStep={currentStep}
        />
      </div>
      
      {/* Activity Monitor */}
      <ActivityMonitor 
        logs={logs}
        status={status}
      />
    </div>
  );
};

export default EcsProvisioningWorkflow;