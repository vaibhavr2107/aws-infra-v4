import { apiRequest } from "@/lib/queryClient";
import { 
  AwsCredentialsRequest, 
  ProvisioningConfig 
} from "@shared/schema";

/**
 * Service for handling AWS API calls
 */

/**
 * Get temporary AWS credentials
 * @param credentials AWS username and password
 * @returns Response from AWS credentials API
 */
export async function getAwsCredentials(credentials: AwsCredentialsRequest) {
  const response = await apiRequest('POST', '/api/aws/credentials', credentials);
  return await response.json();
}

/**
 * Start ECS provisioning
 * @param credentials AWS username and password
 * @param config ECS configuration
 * @returns Response from provisioning API
 */
export async function startEcsProvisioning(
  credentials: AwsCredentialsRequest,
  config: ProvisioningConfig
) {
  const response = await apiRequest('POST', '/api/ecs/provision', {
    credentials,
    config
  });
  return await response.json();
}

/**
 * Get ECS provisioning status
 * @returns Current provisioning status
 */
export async function getEcsProvisioningStatus() {
  const response = await apiRequest('GET', '/api/ecs/status');
  return await response.json();
}

/**
 * Get ECS steps
 * @returns List of ECS provisioning steps
 */
export async function getEcsSteps() {
  const response = await apiRequest('GET', '/api/ecs/steps');
  return await response.json();
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
export function validateEcsConfig(config: ProvisioningConfig): string | null {
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