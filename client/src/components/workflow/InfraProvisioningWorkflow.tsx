
import React, { useState } from 'react';
import { useProvisioning } from '@/context/provisioning-context';
import { useToast } from '@/hooks/use-toast';
import AwsCredentialForm from '@/components/aws-credential-form';
import InfraConfigurationForm from '@/components/infra-configuration-form';
import StepTracker from '@/components/ui/step-tracker';
import ActivityMonitor from '@/components/ui/activity-monitor';
import { validateInfraConfig } from '@/lib/infra-service-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InfraProvisioningWorkflowProps {
  onBack: () => void;
}

const InfraProvisioningWorkflow: React.FC<InfraProvisioningWorkflowProps> = ({ onBack }) => {
  const { 
    provisioningState, 
    infraCredentials,
    infraConfig,
    startProvisioningProcess
  } = useProvisioning();

  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState<'credentials' | 'configuration' | 'provisioning'>('credentials');

  const handleCredentialsNext = () => {
    if (!infraCredentials.username || !infraCredentials.password) {
      toast({
        title: "Validation Error",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }
    setActiveStep('configuration');
  };

  const handleProvisioningStart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!infraCredentials || !infraConfig) {
      toast({
        title: "Validation Error",
        description: "Infrastructure configuration and AWS credentials are required",
        variant: "destructive"
      });
      return;
    }

    const configError = validateInfraConfig(infraConfig);
    if (configError) {
      toast({
        title: "Validation Error",
        description: configError,
        variant: "destructive"
      });
      return;
    }

    try {
      await startProvisioningProcess();
      setActiveStep('provisioning');
    } catch (error: any) {
      toast({
        title: "Provisioning Error",
        description: error.message || "Failed to start infrastructure provisioning",
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
        <h1 className="text-2xl font-bold text-gray-900">Infrastructure Provisioning</h1>
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
            <InfraConfigurationForm 
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
                  Your infrastructure is being created. You can monitor the progress below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm mb-4">
                  <p className="font-medium">Stack Name: <span className="font-normal">{infraConfig?.friendlyStackName}</span></p>
                  <p className="font-medium">Environment: <span className="font-normal capitalize">{infraConfig?.environment}</span></p>
                  <p className="font-medium">Core VPC: <span className="font-normal">{infraConfig?.provisionCoreVpc ? 'Yes' : 'No'}</span></p>
                  <p className="font-medium">ECS Spoke: <span className="font-normal">{infraConfig?.provisionEcsSpoke ? 'Yes' : 'No'}</span></p>
                  <p className="font-medium">EC2 Spoke: <span className="font-normal">{infraConfig?.provisionEc2Spoke ? 'Yes' : 'No'}</span></p>
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
            status={provisioningState.status}
          />

          <ActivityMonitor 
            logs={provisioningState.logs || []}
            status={provisioningState.status || 'pending'}
          />
        </div>
      </div>
    </div>
  );
};

export default InfraProvisioningWorkflow;
