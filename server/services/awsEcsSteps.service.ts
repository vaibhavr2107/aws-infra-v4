import { AwsCredentials } from '@shared/schema';
import { IStorage } from '../storage';
import { ProvisioningStep } from '../utils/syncStepExecutor';
import { ProvisioningConfig } from '@shared/schema';
import { isDummyMode } from '../utils/config';

/**
 * Creates a list of ECS provisioning steps
 * In a real implementation, these would use AWS SDK to provision resources
 * 
 * @param credentials AWS credentials
 * @param config ECS configuration
 * @returns Array of provisioning steps
 */
export function createEcsProvisioningSteps(
  credentials: AwsCredentials,
  config: ProvisioningConfig,
  storage: IStorage
): ProvisioningStep[] {
  // Function to add a log entry to the provisioning state
  const addLog = async (provisioningId: number, message: string) => {
    await storage.addProvisioningLog(provisioningId, message);
  };

  return [
    // Step 1: Setup AWS Authentication
    {
      id: 'authentication',
      name: 'AWS Authentication',
      description: 'Setting up and validating AWS credentials',
      execute: async function() {
        const provisioningStateId = 1; // In a real implementation, this would be passed
        await addLog(provisioningStateId, 'Setting AWS region and initializing service clients...');
        await simulateStepExecution(1000);
        
        await addLog(provisioningStateId, 'Authenticating with AWS using provided credentials...');
        await simulateStepExecution(1500);
        
        await addLog(provisioningStateId, 'Authentication successful! AWS credentials validated.');
      }
    },
    
    // Step 2: Validate AWS Credentials (using STS GetCallerIdentity)
    {
      id: 'validate-credentials',
      name: 'Credential Validation',
      description: 'Validating AWS credentials with STS',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Calling AWS STS GetCallerIdentity...');
        await simulateStepExecution(1200);
        
        await addLog(provisioningStateId, `Credentials validated for user: ${credentials.accessKeyId}`);
      }
    },
    
    // Step 3: Fetch Service Catalog Product Metadata
    {
      id: 'fetch-catalog',
      name: 'Service Catalog Products',
      description: 'Fetching Service Catalog product information',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Retrieving Service Catalog product metadata...');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'Found core-vpc, ecs-spoke, ec2-spoke, and border-controls-spoke products');
        await simulateStepExecution(500);
        
        await addLog(provisioningStateId, 'Product metadata successfully retrieved and cached');
      }
    },
    
    // Step 4: Provision IAM Roles
    {
      id: 'provision-iam',
      name: 'IAM Role Provisioning',
      description: 'Setting up required IAM roles for ECS',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Initiating IAM role provisioning via Service Catalog...');
        await simulateStepExecution(2500);
        
        await addLog(provisioningStateId, `Setting up roles for environment: ${config.environment}`);
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'IAM role provisioning request submitted successfully');
      }
    },
    
    // Step 5: Wait for IAM Role Provisioning Completion
    {
      id: 'wait-iam',
      name: 'Wait for IAM Roles',
      description: 'Waiting for IAM roles to be provisioned',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Polling IAM role provisioning status...');
        await simulateStepExecution(3000);
        
        await addLog(provisioningStateId, 'IAM role provisioning in progress (30%)...');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'IAM role provisioning in progress (60%)...');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'IAM role provisioning in progress (90%)...');
        await simulateStepExecution(1000);
        
        await addLog(provisioningStateId, 'IAM role provisioning completed successfully!');
      }
    },
    
    // Step 6: Provision Infrastructure Components
    {
      id: 'provision-infra',
      name: 'Infrastructure Provisioning',
      description: 'Creating VPC, ECS cluster, and EC2 instances',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Initiating infrastructure provisioning...');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, `Creating ECS cluster '${config.applicationName}' in ${config.environment}...`);
        await simulateStepExecution(2500);
        
        await addLog(provisioningStateId, `Launching ${config.containerCount} container instances with type ${config.instanceType}...`);
        await simulateStepExecution(3000);
        
        await addLog(provisioningStateId, `Setting up auto-scaling: ${config.autoScaling ? 'Enabled' : 'Disabled'}`);
        await simulateStepExecution(1500);
        
        await addLog(provisioningStateId, 'Infrastructure provisioning request submitted successfully');
      }
    },
    
    // Step 7: Wait for Infrastructure Provisioning Completion
    {
      id: 'wait-infra',
      name: 'Wait for Infrastructure',
      description: 'Waiting for infrastructure to be fully provisioned',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Polling infrastructure provisioning status...');
        await simulateStepExecution(3000);
        
        await addLog(provisioningStateId, 'Infrastructure provisioning in progress (20%)...');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'Infrastructure provisioning in progress (40%)...');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'Infrastructure provisioning in progress (60%)...');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'Infrastructure provisioning in progress (80%)...');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'Infrastructure provisioning completed successfully!');
      }
    },
    
    // Step 8: Final Configuration and Testing
    {
      id: 'finalize',
      name: 'Final Configuration',
      description: 'Finalizing ECS setup and testing connectivity',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Performing final configuration steps...');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'Verifying ECS cluster connectivity...');
        await simulateStepExecution(1500);
        
        await addLog(provisioningStateId, 'Testing container launch capability...');
        await simulateStepExecution(2000);
        
        await addLog(
          provisioningStateId, 
          `ECS infrastructure '${config.applicationName}' successfully provisioned and ready to use!`
        );
      }
    }
  ];
}

/**
 * Get step definitions for the frontend
 * @returns Array of step definitions with IDs, titles, descriptions and icons
 */
export function getEcsStepDefinitions() {
  return [
    {
      id: 'authentication',
      title: 'AWS Authentication',
      description: 'Setting up and validating AWS credentials',
      icon: 'lock'
    },
    {
      id: 'validate-credentials',
      title: 'Credential Validation',
      description: 'Validating AWS credentials with STS',
      icon: 'check-circle'
    },
    {
      id: 'fetch-catalog',
      title: 'Service Catalog',
      description: 'Fetching Service Catalog product information',
      icon: 'package'
    },
    {
      id: 'provision-iam',
      title: 'IAM Roles',
      description: 'Setting up required IAM roles for ECS',
      icon: 'user'
    },
    {
      id: 'wait-iam',
      title: 'Wait for IAM',
      description: 'Waiting for IAM roles to be provisioned',
      icon: 'clock'
    },
    {
      id: 'provision-infra',
      title: 'Infrastructure',
      description: 'Creating VPC, ECS cluster, and EC2 instances',
      icon: 'server'
    },
    {
      id: 'wait-infra',
      title: 'Wait for Infrastructure',
      description: 'Waiting for infrastructure to be fully provisioned',
      icon: 'loader'
    },
    {
      id: 'finalize',
      title: 'Finalization',
      description: 'Finalizing ECS setup and testing connectivity',
      icon: 'check-square'
    }
  ];
}

/**
 * Simulates step execution with a delay
 * In dummy mode, delays will be significantly reduced for faster testing
 * 
 * @param ms Milliseconds to delay
 */
async function simulateStepExecution(ms: number): Promise<void> {
  // In dummy mode, drastically reduce the delay time
  const actualDelay = isDummyMode() ? Math.min(300, ms / 5) : ms;
  
  return new Promise(resolve => setTimeout(resolve, actualDelay));
}