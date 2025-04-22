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
  return await apiRequest<ProvisioningResponse>('/api/provision/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      credentials,
      config,
      type: 'ecs'
    }),
  });
}

/**
 * Get the current provisioning status
 * @returns Current provisioning state
 */
export async function getProvisioningStatus(): Promise<ProvisioningState> {
  return await apiRequest<ProvisioningState>('/api/provision/status', {
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
    title: 'Authentication',
    description: 'Authenticating with AWS services',
    icon: 'lock',
    status: 'pending' as const,
  },
  {
    id: 'vpc',
    title: 'VPC Setup',
    description: 'Creating VPC and security groups',
    icon: 'network',
    status: 'pending' as const,
  },
  {
    id: 'cluster',
    title: 'ECS Cluster',
    description: 'Creating ECS cluster',
    icon: 'server',
    status: 'pending' as const,
  },
  {
    id: 'task-definition',
    title: 'Task Definition',
    description: 'Setting up task definition',
    icon: 'file-text',
    status: 'pending' as const,
  },
  {
    id: 'service',
    title: 'ECS Service',
    description: 'Creating ECS service',
    icon: 'cloud',
    status: 'pending' as const,
  },
  {
    id: 'deployment',
    title: 'Deployment',
    description: 'Deploying application containers',
    icon: 'rocket',
    status: 'pending' as const,
  },
];