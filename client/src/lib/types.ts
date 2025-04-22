// AWS Provisioning Step definitions
export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export interface ProvisioningStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: StepStatus;
}

export interface ProvisioningLog {
  timestamp: string;
  message: string;
}

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiresAt: string;
}

export interface EcsConfig {
  applicationName: string;
  environment: 'dev' | 'test' | 'staging' | 'prod';
  instanceType: string;
  containerCount: number;
  autoScaling: boolean;
}

export interface AwsCredentialsRequest {
  username: string;
  password: string;
}

export interface ProvisioningState {
  infrastructureType: 'ecs' | 'eks';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  currentStep: string | null;
  steps: ProvisioningStep[];
  logs: ProvisioningLog[];
  credentials?: AwsCredentials;
  config?: EcsConfig;
}

export interface ProvisioningResponse {
  success: boolean;
  message: string;
  currentStep?: string;
  status?: string;
  log?: string;
}
