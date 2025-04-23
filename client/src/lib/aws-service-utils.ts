import { AwsCredentialsRequest, EcsConfig, ProvisioningLog, ProvisioningState, AwsCredentials, ProvisioningResponse } from './types';
import { apiRequest } from './queryClient';

/**
 * Get temporary AWS credentials
 * @param credentials AWS username and password
 * @returns Temporary AWS credentials
 */
export async function getAwsCredentials(credentials: AwsCredentialsRequest) {
  return await apiRequest<AwsCredentials>('/api/aws/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
}

/**
 * Start the provisioning process
 * @param credentials AWS username and password
 * @param config ECS configuration
 * @returns Provisioning response
 */
export async function startProvisioning(
  credentials: AwsCredentialsRequest,
  config: EcsConfig
) {
  return await apiRequest<ProvisioningResponse>('/api/ecs/provision', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      credentials,
      config,
      infrastructureType: 'ecs'
    }),
  });
}

/**
 * Get the current provisioning status
 * @returns Current provisioning state
 */
export async function getProvisioningStatus(): Promise<ProvisioningState> {
  return await apiRequest<ProvisioningState>('/api/ecs/status', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Format a log message with timestamp
 * @param message Log message
 * @returns Formatted log object
 */
export function formatLog(message: string): ProvisioningLog {
  return {
    timestamp: new Date().toLocaleTimeString(),
    message
  };
}

/**
 * Validate AWS credentials
 * @param credentials AWS username and password
 * @returns Error message or null if valid
 */
export function validateAwsCredentials(credentials: AwsCredentialsRequest): string | null {
  if (!credentials.username) {
    return 'Username is required';
  }
  
  if (!credentials.password) {
    return 'Password is required';
  }
  
  return null;
}

/**
 * Validate ECS configuration
 * @param config ECS configuration
 * @returns Error message or null if valid
 */
export function validateEcsConfig(config: EcsConfig): string | null {
  if (!config.applicationName) {
    return 'Application name is required';
  }
  
  if (!config.environment) {
    return 'Environment is required';
  }
  
  if (!config.instanceType) {
    return 'Instance type is required';
  }
  
  if (config.containerCount < 1 || config.containerCount > 10) {
    return 'Container count must be between 1 and 10';
  }
  
  return null;
}

/**
 * ECS provisioning steps
 */
export const ecsSteps = [
  {
    id: 'authentication',
    title: 'AWS Authentication',
    description: 'Setting up and validating AWS credentials',
    icon: 'lock',
    status: 'pending' as const,
  },
  {
    id: 'validate-credentials',
    title: 'Credential Validation',
    description: 'Validating AWS credentials with STS',
    icon: 'check-circle',
    status: 'pending' as const,
  },
  {
    id: 'fetch-catalog',
    title: 'Service Catalog',
    description: 'Fetching Service Catalog product information',
    icon: 'package',
    status: 'pending' as const,
  },
  {
    id: 'provision-iam',
    title: 'IAM Roles',
    description: 'Setting up required IAM roles for ECS',
    icon: 'user',
    status: 'pending' as const,
  },
  {
    id: 'wait-iam',
    title: 'Wait for IAM',
    description: 'Waiting for IAM roles to be provisioned',
    icon: 'clock',
    status: 'pending' as const,
  },
  {
    id: 'provision-infra',
    title: 'Infrastructure',
    description: 'Creating VPC, ECS cluster, and EC2 instances',
    icon: 'server',
    status: 'pending' as const,
  },
  {
    id: 'wait-infra',
    title: 'Wait for Infrastructure',
    description: 'Waiting for infrastructure to be fully provisioned',
    icon: 'loader',
    status: 'pending' as const,
  },
  {
    id: 'finalize',
    title: 'Finalization',
    description: 'Finalizing ECS setup and testing connectivity',
    icon: 'check-square',
    status: 'pending' as const,
  }
];