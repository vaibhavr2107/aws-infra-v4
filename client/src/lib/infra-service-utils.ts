import { 
  AwsCredentialsRequest, 
  EcsConfig, 
  ProvisioningState, 
  ProvisioningLog, 
  ProvisioningStep as Step 
} from './types';
import { InfraConfig } from './types/infra-config';
import { formatLog } from './aws-service-utils';
import { apiRequest } from './queryClient';

/**
 * Step definitions for infrastructure provisioning
 */
export const infraSteps: Step[] = [
  {
    id: 'setup-auth',
    title: 'AWS Authentication Setup',
    description: 'Set up AWS region and credentials',
    icon: 'key',
    status: 'pending',
  },
  {
    id: 'validate-creds',
    title: 'Validate Credentials',
    description: 'Verify AWS credentials using STS',
    icon: 'check-circle',
    status: 'pending',
  },
  {
    id: 'fetch-metadata',
    title: 'Fetch Catalog Metadata',
    description: 'Retrieve Service Catalog product information',
    icon: 'database',
    status: 'pending',
  },
  {
    id: 'provision-iam',
    title: 'Provision IAM Roles',
    description: 'Set up required IAM roles for infrastructure',
    icon: 'shield',
    status: 'pending',
  },
  {
    id: 'wait-iam',
    title: 'Wait for IAM Roles',
    description: 'Wait for IAM role provisioning to complete',
    icon: 'clock',
    status: 'pending',
  },
  {
    id: 'provision-core',
    title: 'Core Infrastructure',
    description: 'Provision VPC and core networking components',
    icon: 'server',
    status: 'pending',
  },
  {
    id: 'provision-spokes',
    title: 'Service Catalog Spokes',
    description: 'Provision service-specific components',
    icon: 'git-branch',
    status: 'pending',
  },
  {
    id: 'validate-infra',
    title: 'Validate Infrastructure',
    description: 'Verify all infrastructure components',
    icon: 'check',
    status: 'pending',
  },
  {
    id: 'final-config',
    title: 'Final Configuration',
    description: 'Apply final configuration settings',
    icon: 'settings',
    status: 'pending',
  },
];

/**
 * Get infrastructure provisioning steps
 * @returns Array of infrastructure provisioning steps
 */
export async function getInfraSteps() {
  const response = await apiRequest<{ success: boolean, steps: Step[] }>('/api/infra/steps');
  
  if (!response.success) {
    throw new Error('Failed to fetch infrastructure steps');
  }
  
  return response.steps;
}

/**
 * Start the infrastructure provisioning process
 * @param credentials AWS username and password
 * @param infraConfig Detailed infrastructure configuration
 * @returns Provisioning response
 */
export async function startInfraProvisioning(
  credentials: AwsCredentialsRequest,
  infraConfig?: InfraConfig
) {
  if (!infraConfig) {
    throw new Error('Infrastructure configuration is required');
  }

  const response = await apiRequest<{ success: boolean, message: string }>('/api/infra/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      credentials,
      config: infraConfig,
      infrastructureType: 'infra'
    }),
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to start infrastructure provisioning');
  }

  return response;

  const response = await apiRequest<{ success: boolean, message: string, provisioningId: number }>(
    '/api/infra/start',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credentials,
        config: configToSend,
        infrastructureType: 'infra',
      }),
    }
  );
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to start infrastructure provisioning');
  }
  
  return response;
}

/**
 * Get infrastructure provisioning status
 * @returns Current provisioning state
 */
export async function getInfraProvisioningStatus(): Promise<ProvisioningState> {
  const response = await apiRequest<ProvisioningState>('/api/infra/status');
  
  if (!response) {
    return {
      infrastructureType: 'infra',
      status: 'pending',
      currentStep: null,
      steps: infraSteps,
      logs: [],
    };
  }
  
  return response;
}

/**
 * Validate infrastructure configuration
 * @param config Infrastructure configuration
 * @returns Error message or null if valid
 */
export function validateInfraConfig(config: InfraConfig): string | null {
  if (!config.friendlyStackName || config.friendlyStackName.length < 3) {
    return 'Stack name must be at least 3 characters';
  }
  
  if (!config.environment) {
    return 'Environment is required';
  }
  
  // Add any other validations specific to infrastructure
  
  return null;
}