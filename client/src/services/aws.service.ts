import { apiRequest } from "@/lib/queryClient";
import { 
  AwsCredentialsRequest,
  EcsConfig 
} from "@/lib/types";

/**
 * Service for handling AWS API calls
 */

/**
 * Get temporary AWS credentials
 * @param credentials AWS username and password
 * @returns Response from AWS credentials API
 */
export async function getAwsCredentials(credentials: AwsCredentialsRequest) {
  return await apiRequest('/api/aws/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });
}

/**
 * Start ECS provisioning
 * @param credentials AWS username and password
 * @param config ECS configuration
 * @returns Response from provisioning API
 */
export async function startEcsProvisioning(
  credentials: AwsCredentialsRequest,
  config: EcsConfig
) {
  return await apiRequest('/api/provision/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      credentials,
      config,
      type: 'ecs'
    })
  });
}

/**
 * Get ECS provisioning status
 * @returns Current provisioning status
 */
export async function getEcsProvisioningStatus() {
  return await apiRequest('/api/provision/status', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Get ECS steps
 * @returns List of ECS provisioning steps
 */
export async function getEcsSteps() {
  return await apiRequest('/api/ecs/steps', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Validate AWS credentials
 */
export function validateAwsCredentials(credentials: AwsCredentialsRequest): string | null {
  if (!credentials.username || credentials.username.length < 3) {
    return "AWS username must be at least 3 characters";
  }
  
  if (!credentials.password || credentials.password.length < 3) {
    return "Password must be at least 3 characters";
  }
  
  return null;
}

/**
 * Validate ECS configuration
 */
export function validateEcsConfig(config: EcsConfig): string | null {
  if (!config.applicationName || config.applicationName.length < 3) {
    return "Application name must be at least 3 characters";
  }
  
  if (!config.environment) {
    return "Environment must be selected";
  }
  
  if (!config.instanceType) {
    return "Instance type must be selected";
  }
  
  if (config.containerCount < 1 || config.containerCount > 10) {
    return "Container count must be between 1 and 10";
  }
  
  return null;
}