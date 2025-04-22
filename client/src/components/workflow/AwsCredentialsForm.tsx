import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AwsCredentialsRequest } from '@shared/schema';

interface AwsCredentialsFormProps {
  credentials: AwsCredentialsRequest;
  onCredentialsChange: (credentials: Partial<AwsCredentialsRequest>) => void;
  disabled?: boolean;
}

/**
 * AWS Credentials Form Component
 * Allows users to input their AWS credentials for authentication
 */
const AwsCredentialsForm: React.FC<AwsCredentialsFormProps> = ({
  credentials,
  onCredentialsChange,
  disabled = false
}) => {
  return (
    <div className="space-y-6 mb-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">AWS Credentials</h3>
        <p className="text-sm text-gray-500 mb-4">
          Enter your organization AWS credentials to authenticate and provision resources.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="aws-username">AWS Username</Label>
          <Input
            id="aws-username"
            type="text"
            placeholder="Enter your AWS username"
            value={credentials.username}
            onChange={(e) => onCredentialsChange({ username: e.target.value })}
            disabled={disabled}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="aws-password">Password</Label>
          <Input
            id="aws-password"
            type="password"
            placeholder="Enter your AWS password"
            value={credentials.password}
            onChange={(e) => onCredentialsChange({ password: e.target.value })}
            disabled={disabled}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Your password will be used only to generate temporary AWS credentials. It won't be stored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AwsCredentialsForm;