import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProvisioningConfig } from "@shared/schema";

interface EcsConfigFormProps {
  config: ProvisioningConfig;
  onConfigChange: (config: Partial<ProvisioningConfig>) => void;
  disabled?: boolean;
}

/**
 * ECS Configuration Form Component
 * Allows users to input configuration parameters for ECS provisioning
 */
const EcsConfigForm: React.FC<EcsConfigFormProps> = ({
  config,
  onConfigChange,
  disabled = false
}) => {
  return (
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
          value={config.applicationName}
          onChange={(e) => onConfigChange({ applicationName: e.target.value })}
          placeholder="e.g., payment-service"
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aws-blue focus:border-aws-blue"
          required
        />
      </div>
      
      <div className="mb-4">
        <Label htmlFor="environment" className="block text-sm font-medium text-gray-700 mb-1">
          Environment
        </Label>
        <Select 
          value={config.environment} 
          onValueChange={(value) => onConfigChange({ environment: value as 'dev' | 'test' | 'staging' | 'prod' })}
          disabled={disabled}
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
          value={config.instanceType} 
          onValueChange={(value) => onConfigChange({ instanceType: value })}
          disabled={disabled}
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
          value={config.containerCount}
          onChange={(e) => onConfigChange({ containerCount: parseInt(e.target.value) })}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aws-blue focus:border-aws-blue"
        />
      </div>
      
      <div className="mb-4">
        <div className="flex items-center">
          <Checkbox
            id="auto-scaling"
            checked={config.autoScaling}
            onCheckedChange={(checked) => onConfigChange({ autoScaling: checked as boolean })}
            disabled={disabled}
            className="h-4 w-4 text-aws-blue focus:ring-aws-blue border-gray-300 rounded"
          />
          <Label htmlFor="auto-scaling" className="ml-2 block text-sm text-gray-700">
            Enable Auto Scaling
          </Label>
        </div>
        <p className="text-xs text-gray-500 mt-1 ml-6">
          Automatically adjust container count based on resource utilization
        </p>
      </div>
    </div>
  );
};

export default EcsConfigForm;