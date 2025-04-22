import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { ProvisioningConfig } from '@shared/schema';

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
    <div className="space-y-6 mb-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Application Configuration</h3>
        <p className="text-sm text-gray-500 mb-4">
          Configure the ECS infrastructure to be provisioned.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Application Name */}
        <div className="space-y-2">
          <Label htmlFor="app-name">Application Name</Label>
          <Input
            id="app-name"
            placeholder="e.g., web-service"
            value={config.applicationName}
            onChange={(e) => onConfigChange({ applicationName: e.target.value })}
            disabled={disabled}
            required
          />
          <p className="text-xs text-gray-500">
            Name will be used as a prefix for all created resources
          </p>
        </div>
        
        {/* Environment */}
        <div className="space-y-2">
          <Label htmlFor="environment">Environment</Label>
          <Select
            value={config.environment}
            onValueChange={(value) => onConfigChange({ environment: value as 'dev' | 'test' | 'staging' | 'prod' })}
            disabled={disabled}
          >
            <SelectTrigger id="environment">
              <SelectValue placeholder="Select an environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dev">Development</SelectItem>
              <SelectItem value="test">Testing</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="prod">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Instance Type */}
        <div className="space-y-2">
          <Label htmlFor="instance-type">Instance Type</Label>
          <Select
            value={config.instanceType}
            onValueChange={(value) => onConfigChange({ instanceType: value })}
            disabled={disabled}
          >
            <SelectTrigger id="instance-type">
              <SelectValue placeholder="Select instance type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="t2.micro">t2.micro (1 vCPU, 1 GiB RAM)</SelectItem>
              <SelectItem value="t2.small">t2.small (1 vCPU, 2 GiB RAM)</SelectItem>
              <SelectItem value="t2.medium">t2.medium (2 vCPU, 4 GiB RAM)</SelectItem>
              <SelectItem value="t2.large">t2.large (2 vCPU, 8 GiB RAM)</SelectItem>
              <SelectItem value="m5.large">m5.large (2 vCPU, 8 GiB RAM)</SelectItem>
              <SelectItem value="m5.xlarge">m5.xlarge (4 vCPU, 16 GiB RAM)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Select appropriate instance type based on workload requirements
          </p>
        </div>
        
        {/* Container Count */}
        <div className="space-y-2">
          <Label htmlFor="container-count">Container Count</Label>
          <Input
            id="container-count"
            type="number"
            min={1}
            max={10}
            value={config.containerCount}
            onChange={(e) => onConfigChange({ containerCount: parseInt(e.target.value) })}
            disabled={disabled}
            required
          />
          <p className="text-xs text-gray-500">
            Number of containers to run (1-10)
          </p>
        </div>
        
        {/* Auto Scaling */}
        <div className="flex items-center space-x-2 pt-4">
          <Switch
            id="auto-scaling"
            checked={config.autoScaling}
            onCheckedChange={(checked) => onConfigChange({ autoScaling: checked })}
            disabled={disabled}
          />
          <Label htmlFor="auto-scaling" className="cursor-pointer">
            Enable Auto Scaling
          </Label>
        </div>
        <p className="text-xs text-gray-500 -mt-2">
          Automatically adjust container count based on CPU/Memory utilization
        </p>
      </div>
    </div>
  );
};

export default EcsConfigForm;