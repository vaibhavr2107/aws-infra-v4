import React from 'react';
import { useProvisioning } from '@/context/provisioning-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SiAmazon } from 'react-icons/si';

interface AwsCredentialFormProps {
  disabled?: boolean;
  onNext?: () => void;
}

const AwsCredentialForm: React.FC<AwsCredentialFormProps> = ({ 
  disabled = false,
  onNext
}) => {
  const { 
    currentPage, 
    ecsCredentials, 
    infraCredentials, 
    updateEcsCredentials, 
    updateInfraCredentials 
  } = useProvisioning();

  // Select the appropriate credentials and update function based on the current page
  const credentials = currentPage === 'infra' ? infraCredentials : ecsCredentials;
  const updateCredentials = currentPage === 'infra' ? updateInfraCredentials : updateEcsCredentials;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNext) onNext();
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <SiAmazon className="h-6 w-6 text-aws-orange" />
          <CardTitle className="text-2xl">AWS Credentials</CardTitle>
        </div>
        <CardDescription>
          Enter your AWS IAM user credentials to access AWS services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">IAM Username</Label>
            <Input
              id="username"
              placeholder="Enter your IAM username"
              value={credentials.username}
              onChange={(e) => updateCredentials({ username: e.target.value })}
              disabled={disabled}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">IAM Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your IAM password"
              value={credentials.password}
              onChange={(e) => updateCredentials({ password: e.target.value })}
              disabled={disabled}
              required
            />
          </div>
          
          <Button 
            type="submit"
            className="w-full bg-aws-blue hover:bg-aws-blue/90"
            disabled={disabled || !credentials.username || !credentials.password}
          >
            Next
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AwsCredentialForm;