import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useProvisioning } from "@/context/provisioning-context";

interface AwsCredentialFormProps {
  disabled?: boolean;
}

const AwsCredentialForm: React.FC<AwsCredentialFormProps> = ({ disabled = false }) => {
  const { awsCredentials, updateAwsCredentials } = useProvisioning();
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Credentials
      </h3>
      
      <div className="mb-4">
        <Label htmlFor="aws-username" className="block text-sm font-medium text-gray-700 mb-1">
          AWS Username
        </Label>
        <Input
          id="aws-username"
          type="text"
          value={awsCredentials.username}
          onChange={(e) => updateAwsCredentials({ username: e.target.value })}
          placeholder="Enter your AWS username"
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aws-blue focus:border-aws-blue"
          required
        />
      </div>
      
      <div className="mb-2">
        <Label htmlFor="aws-password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </Label>
        <Input
          id="aws-password"
          type="password"
          value={awsCredentials.password}
          onChange={(e) => updateAwsCredentials({ password: e.target.value })}
          placeholder="Enter your AWS password"
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aws-blue focus:border-aws-blue"
          required
        />
      </div>
    </div>
  );
};

export default AwsCredentialForm;
