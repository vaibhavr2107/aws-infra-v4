import React, { useState } from 'react';
import { useProvisioning } from '@/context/provisioning-context';
import { useToast } from '@/hooks/use-toast';
import AwsCredentialForm from '@/components/aws-credential-form';
import EcsConfigurationForm from '@/components/ecs-configuration-form';
import StepTracker from '@/components/ui/step-tracker';
import ActivityMonitor from '@/components/ui/activity-monitor';
import { validateAwsCredentials, validateEcsConfig } from '@/lib/aws-service-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EcsProvisioningWorkflowProps {
  onBack: () => void;
}

const EcsProvisioningWorkflow: React.FC<EcsProvisioningWorkflowProps> = ({ onBack }) => {
  const { 
    provisioningState, 
    awsCredentials,
    ecsConfig,
    startProvisioningProcess
  } = useProvisioning();
  
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState<'credentials' | 'configuration' | 'provisioning'>('credentials');
  
  const handleCredentialsNext = () => {
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
    
    setActiveStep('configuration');
  };
  
  const handleProvisioningStart = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    try {
      await startProvisioningProcess();
      setActiveStep('provisioning');
    } catch (error) {
      toast({
        title: "Provisioning Error",
        description: "Failed to start the provisioning process. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleConfigurationBack = () => {
    setActiveStep('credentials');
  };
  
  return (
    <div className="max-w-7xl mx-auto pb-6">
      <div className="mb-6 flex items-center">
        <Button
          onClick={onBack}
          variant="ghost"
          className="flex items-center mr-4 gap-1 p-0 h-auto hover:bg-transparent"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Services</span>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">ECS Infrastructure Provisioning</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Side - Forms */}
        <div>
          {activeStep === 'credentials' && (
            <AwsCredentialForm
              onNext={handleCredentialsNext}
              disabled={provisioningState.status === 'in-progress'}
            />
          )}
          
          {activeStep === 'configuration' && (
            <EcsConfigurationForm 
              onSubmit={handleProvisioningStart}
              onBack={handleConfigurationBack}
              disabled={provisioningState.status === 'in-progress'}
            />
          )}
          
          {activeStep === 'provisioning' && (
            <Card>
              <CardHeader>
                <CardTitle>Provisioning in Progress</CardTitle>
                <CardDescription>
                  Your ECS infrastructure is being created. You can monitor the progress below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm mb-4">
                  <p className="font-medium">Application: <span className="font-normal">{ecsConfig.applicationName}</span></p>
                  <p className="font-medium">Environment: <span className="font-normal capitalize">{ecsConfig.environment}</span></p>
                  <p className="font-medium">Instance Type: <span className="font-normal">{ecsConfig.instanceType}</span></p>
                  <p className="font-medium">Containers: <span className="font-normal">{ecsConfig.containerCount}</span></p>
                  <p className="font-medium">Auto Scaling: <span className="font-normal">{ecsConfig.autoScaling ? 'Enabled' : 'Disabled'}</span></p>
                </div>
                
                {(provisioningState.status === 'failed' || provisioningState.status === 'completed') && (
                  <Button 
                    onClick={() => setActiveStep('configuration')}
                    variant="outline"
                    className="w-full"
                  >
                    {provisioningState.status === 'failed' ? 'Retry Configuration' : 'New Deployment'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right Side - Status and Logs */}
        <div className="space-y-6">
          <StepTracker 
            steps={provisioningState.steps} 
            currentStep={provisioningState.currentStep}
          />
          
          <ActivityMonitor 
            logs={provisioningState.logs}
            status={provisioningState.status}
          />
        </div>
      </div>
    </div>
  );
};

export default EcsProvisioningWorkflow;