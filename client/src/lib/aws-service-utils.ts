import { apiRequest } from "@/lib/queryClient";
import { 
  AwsCredentialsRequest, 
  AwsCredentials, 
  EcsConfig, 
  ProvisioningResponse,
  ProvisioningState,
  ProvisioningLog
} from "@/lib/types";

// Function to get AWS temporary credentials
export async function getAwsCredentials(credentials: AwsCredentialsRequest): Promise<AwsCredentials> {
  const response = await apiRequest('POST', '/api/aws/credentials', credentials);
  return response.json();
}

// Function to start provisioning
export async function startProvisioning(
  infrastructureType: 'ecs' | 'eks',
  credentials: AwsCredentialsRequest,
  config: EcsConfig
): Promise<ProvisioningResponse> {
  const response = await apiRequest('POST', '/api/provision/start', {
    infrastructureType,
    credentials,
    config
  });
  return response.json();
}

// Function to check provisioning status
export async function getProvisioningStatus(): Promise<ProvisioningState> {
  const response = await apiRequest('GET', '/api/provision/status');
  return response.json();
}

// Helper function to format logs
export function formatLog(message: string): ProvisioningLog {
  return {
    timestamp: new Date().toLocaleTimeString(),
    message
  };
}

// Function to validate AWS Credentials form
export function validateAwsCredentials(credentials: AwsCredentialsRequest): string | null {
  if (!credentials.username || credentials.username.length < 3) {
    return "AWS username must be at least 3 characters";
  }
  
  if (!credentials.password || credentials.password.length < 3) {
    return "Password must be at least 3 characters";
  }
  
  return null;
}

// Function to validate ECS Config form
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

// Utility function for steps
export const ecsSteps = [
  {
    id: "authentication",
    title: "AWS Authentication",
    description: "Verify credentials and obtain temporary session token",
    icon: "lock",
    status: "pending"
  },
  {
    id: "vpc",
    title: "VPC Configuration",
    description: "Configure networking and security groups",
    icon: "globe",
    status: "pending"
  },
  {
    id: "cluster",
    title: "ECS Cluster Creation",
    description: "Provision ECS cluster with specified configuration",
    icon: "layout-grid",
    status: "pending"
  },
  {
    id: "task-definition",
    title: "Task Definition",
    description: "Configure container definitions and resource requirements",
    icon: "file-text",
    status: "pending"
  },
  {
    id: "service",
    title: "ECS Service Configuration",
    description: "Setup load balancing and auto-scaling policies",
    icon: "settings",
    status: "pending"
  },
  {
    id: "deployment",
    title: "Service Deployment",
    description: "Deploy service and verify health checks",
    icon: "rocket",
    status: "pending"
  }
];
