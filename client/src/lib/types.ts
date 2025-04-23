/**
 * Step status type
 */
export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

/**
 * Provisioning step
 */
export interface ProvisioningStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: StepStatus;
}

/**
 * Provisioning log entry
 */
export interface ProvisioningLog {
  timestamp: string;
  message: string;
}

/**
 * AWS temporary credentials
 */
export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiresAt: string;
}

/**
 * ECS configuration
 */
export interface EcsConfig {
  applicationName: string;
  environment: 'dev' | 'test' | 'staging' | 'prod';
  instanceType: string;
  containerCount: number;
  autoScaling: boolean;
}

/**
 * Infrastructure configuration
 */
export interface InfraConfig {
  // Infrastructure specific fields
  friendlyStackName: string;
  environment: 'dev' | 'test' | 'prod';
  ecsTaskRole: boolean;
  provisionCoreVpc: boolean;
  provisionEcsSpoke: boolean;
  provisionEc2Spoke: boolean;
  provisionBorderControlSpoke: boolean;
  bcAdminAdGroup: string;
  vpcProvisioningArtifactName: string;
  bcProvisioningArtifactName: string;
  bcAdminAdGroupDomain: string;
  ec2SpokeProvisioningArtifactName: string;
  ecsSpokeProvisioningArtifactName: string;
  linuxGroup: string;
  windowsGroup: string;
}

/**
 * AWS credentials request
 */
export interface AwsCredentialsRequest {
  username: string;
  password: string;
}

/**
 * Provisioning state
 */
export interface ProvisioningState {
  infrastructureType: 'ecs' | 'eks' | 'infra';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  currentStep: string | null;
  steps: ProvisioningStep[];
  logs: ProvisioningLog[];
  credentials?: AwsCredentials;
  config?: any; // This allows it to hold either EcsConfig or InfraConfig
}

/**
 * Provisioning response from API
 */
export interface ProvisioningResponse {
  success: boolean;
  message: string;
  currentStep?: string;
  status?: string;
  log?: string;
}