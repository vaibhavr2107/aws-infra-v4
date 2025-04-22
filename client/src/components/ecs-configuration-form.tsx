import React from 'react';
import { useProvisioning } from '@/context/provisioning-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SiAmazonecs } from 'react-icons/si';

interface EcsConfigurationFormProps {
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  onBack?: () => void;
}

const EcsConfigurationForm: React.FC<EcsConfigurationFormProps> = ({
  onSubmit,
  disabled = false,
  onBack
}) => {
  const { ecsConfig, updateEcsConfig } = useProvisioning();

  const instanceTypes = [
    { value: 't2.micro', label: 't2.micro (1 vCPU, 1 GiB RAM)' },
    { value: 't2.small', label: 't2.small (1 vCPU, 2 GiB RAM)' },
    { value: 't2.medium', label: 't2.medium (2 vCPU, 4 GiB RAM)' },
    { value: 't3.micro', label: 't3.micro (2 vCPU, 1 GiB RAM)' },
    { value: 't3.small', label: 't3.small (2 vCPU, 2 GiB RAM)' },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <SiAmazonecs className="h-6 w-6 text-aws-orange" />
          <CardTitle className="text-2xl">ECS Configuration</CardTitle>
        </div>
        <CardDescription>
          Configure your Amazon ECS deployment settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="applicationName">Application Name</Label>
            <Input
              id="applicationName"
              placeholder="my-ecs-app"
              value={ecsConfig.applicationName}
              onChange={(e) => updateEcsConfig({ applicationName: e.target.value })}
              disabled={disabled}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="environment">Environment</Label>
            <Select 
              value={ecsConfig.environment} 
              onValueChange={(value) => updateEcsConfig({ environment: value as 'dev' | 'test' | 'staging' | 'prod' })}
              disabled={disabled}
            >
              <SelectTrigger id="environment">
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

          <div className="space-y-2">
            <Label htmlFor="instanceType">Instance Type</Label>
            <Select 
              value={ecsConfig.instanceType} 
              onValueChange={(value) => updateEcsConfig({ instanceType: value })}
              disabled={disabled}
            >
              <SelectTrigger id="instanceType">
                <SelectValue placeholder="Select instance type" />
              </SelectTrigger>
              <SelectContent>
                {instanceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="containerCount">Container Count</Label>
            <Input
              id="containerCount"
              type="number"
              min={1}
              max={10}
              placeholder="1"
              value={ecsConfig.containerCount.toString()}
              onChange={(e) => updateEcsConfig({ containerCount: parseInt(e.target.value) || 1 })}
              disabled={disabled}
              required
            />
          </div>
          
          <div className="flex items-center justify-between space-y-0 pt-2">
            <Label htmlFor="autoScaling" className="cursor-pointer">Auto Scaling</Label>
            <Switch
              id="autoScaling"
              checked={ecsConfig.autoScaling}
              onCheckedChange={(checked) => updateEcsConfig({ autoScaling: checked })}
              disabled={disabled}
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            {onBack && (
              <Button 
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={disabled}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button 
              type="submit"
              className={`bg-aws-blue hover:bg-aws-blue/90 ${onBack ? 'flex-1' : 'w-full'}`}
              disabled={disabled || !ecsConfig.applicationName || !ecsConfig.environment || !ecsConfig.instanceType}
            >
              Start Provisioning
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EcsConfigurationForm;