import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useProvisioning } from "@/context/provisioning-context";
import AwsCredentialForm from "@/components/aws-credential-form";

interface EcsConfigurationFormProps {
  onSubmit: (e: React.FormEvent) => void;
}

const EcsConfigurationForm: React.FC<EcsConfigurationFormProps> = ({ onSubmit }) => {
  const { 
    ecsConfig, 
    updateEcsConfig, 
    isLoading, 
    provisioningState
  } = useProvisioning();
  
  const isFormDisabled = isLoading || provisioningState.status === 'in-progress' || 
                          provisioningState.status === 'completed';
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Configuration</h2>
      
      <form id="provisioning-form" onSubmit={onSubmit}>
        {/* AWS Credentials Section */}
        <AwsCredentialForm disabled={isFormDisabled} />
        
        {/* Application Details Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Application Details
          </h3>
          
          <div className="mb-4">
            <Label htmlFor="app-name" className="block text-sm font-medium text-gray-700 mb-1">
              Application Name
            </Label>
            <Input
              id="app-name"
              type="text"
              value={ecsConfig.applicationName}
              onChange={(e) => updateEcsConfig({ applicationName: e.target.value })}
              placeholder="e.g., payment-service"
              disabled={isFormDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aws-blue focus:border-aws-blue"
              required
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="environment" className="block text-sm font-medium text-gray-700 mb-1">
              Environment
            </Label>
            <Select 
              value={ecsConfig.environment} 
              onValueChange={(value) => updateEcsConfig({ environment: value as any })}
              disabled={isFormDisabled}
            >
              <SelectTrigger id="environment" className="w-full bg-white">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">Development</SelectItem>
                <SelectItem value="test">Testing</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="prod">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="instance-type" className="block text-sm font-medium text-gray-700 mb-1">
              Instance Type
            </Label>
            <Select 
              value={ecsConfig.instanceType} 
              onValueChange={(value) => updateEcsConfig({ instanceType: value })}
              disabled={isFormDisabled}
            >
              <SelectTrigger id="instance-type" className="w-full bg-white">
                <SelectValue placeholder="Select instance type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="t2.micro">t2.micro (1 vCPU, 1 GiB RAM)</SelectItem>
                <SelectItem value="t2.small">t2.small (1 vCPU, 2 GiB RAM)</SelectItem>
                <SelectItem value="t2.medium">t2.medium (2 vCPU, 4 GiB RAM)</SelectItem>
                <SelectItem value="t2.large">t2.large (2 vCPU, 8 GiB RAM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="container-count" className="block text-sm font-medium text-gray-700 mb-1">
              Desired Container Count
            </Label>
            <Input
              id="container-count"
              type="number"
              min={1}
              max={10}
              value={ecsConfig.containerCount}
              onChange={(e) => updateEcsConfig({ containerCount: parseInt(e.target.value) })}
              disabled={isFormDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aws-blue focus:border-aws-blue"
            />
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <Checkbox
                id="auto-scaling"
                checked={ecsConfig.autoScaling}
                onCheckedChange={(checked) => updateEcsConfig({ autoScaling: checked as boolean })}
                disabled={isFormDisabled}
                className="h-4 w-4 text-aws-blue focus:ring-aws-blue border-gray-300 rounded"
              />
              <Label htmlFor="auto-scaling" className="ml-2 block text-sm text-gray-700">
                Enable Auto Scaling
              </Label>
            </div>
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={isFormDisabled}
          className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            provisioningState.status === 'completed'
              ? 'bg-success hover:bg-success/90'
              : 'bg-aws-blue hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aws-blue`}
        >
          {isLoading || provisioningState.status === 'in-progress' ? (
            <>
              <i className="ri-loader-4-line animate-spin mr-2"></i>
              Provisioning...
            </>
          ) : provisioningState.status === 'completed' ? (
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
    </div>
  );
};

export default EcsConfigurationForm;
