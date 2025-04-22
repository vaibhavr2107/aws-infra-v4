import { AwsCredentials, ProvisioningConfig } from '@shared/schema';
import { IStorage } from '../storage';
import { ProvisioningStep } from '../utils/syncStepExecutor';
import { isDummyMode } from '../utils/config';

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

/**
 * Creates a list of infrastructure provisioning steps
 * In a real implementation, these would use AWS SDK to provision resources via Service Catalog
 * 
 * @param credentials AWS credentials
 * @param config Provisioning configuration
 * @param storage Storage interface for persisting logs
 * @returns Array of provisioning steps
 */
export function createInfraProvisioningSteps(
  credentials: AwsCredentials,
  config: ProvisioningConfig,
  storage: IStorage
): ProvisioningStep[] {
  // Helper function to add logs to the latest provisioning state
  async function addLog(provisioningStateId: number, message: string) {
    await storage.addProvisioningLog(provisioningStateId, message);
  }

  return [
    // Step 1: Setup AWS Authentication
    {
      id: 'setup-auth',
      name: 'AWS Authentication Setup',
      description: 'Setting up AWS region and injecting credentials',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Setting AWS region and initializing credentials...');
        await simulateStepExecution(1500);
        
        await addLog(provisioningStateId, 'Fetching credentials from internal organization endpoint...');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'Initializing AWS SDK clients (ServiceCatalogClient, STSClient)...');
        await simulateStepExecution(1000);
        
        await addLog(provisioningStateId, 'AWS authentication setup completed successfully');
      }
    },
    
    // Step 2: Validate AWS Credentials
    {
      id: 'validate-creds',
      name: 'AWS Credentials Validation',
      description: 'Validating AWS credentials using STS',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Calling AWS STS GetCallerIdentity to validate credentials...');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, `Successfully validated credentials for account: 123456789012`);
        await simulateStepExecution(500);
        
        await addLog(provisioningStateId, 'Credentials validation successful');
      }
    },
    
    // Step 3: Fetch Service Catalog Product Metadata
    {
      id: 'fetch-metadata',
      name: 'Service Catalog Metadata',
      description: 'Retrieving Service Catalog product information',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Retrieving Service Catalog product metadata...');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'Calling DescribeProduct for core-vpc...');
        await simulateStepExecution(1000);
        
        await addLog(provisioningStateId, 'Calling DescribeProduct for ecs-spoke...');
        await simulateStepExecution(1000);
        
        await addLog(provisioningStateId, 'Calling DescribeProduct for ec2-spoke...');
        await simulateStepExecution(1000);
        
        await addLog(provisioningStateId, 'Calling DescribeProduct for border-controls-spoke...');
        await simulateStepExecution(1000);
        
        await addLog(provisioningStateId, 'Service Catalog product metadata successfully retrieved and cached');
      }
    },
    
    // Step 4: Provision IAM Roles
    {
      id: 'provision-iam',
      name: 'IAM Role Provisioning',
      description: 'Setting up required IAM roles via Service Catalog',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Initiating IAM role provisioning via Service Catalog...');
        await simulateStepExecution(1500);
        
        await addLog(provisioningStateId, 'Calling ProvisionProduct for 085728974218-test-framework-IamRoles...');
        await simulateStepExecution(1000);
        
        await addLog(provisioningStateId, `Setting environment parameter to: ${config.environment}`);
        await simulateStepExecution(500);
        
        await addLog(provisioningStateId, `Setting FriendlyStackName parameter to: ${config.applicationName}-IAM`);
        await simulateStepExecution(500);
        
        await addLog(provisioningStateId, 'Setting ProvisionEcsTaskControlRole flag to: true');
        await simulateStepExecution(500);
        
        await addLog(provisioningStateId, 'IAM role provisioning request submitted successfully');
      }
    },
    
    // Step 5: Wait for IAM Role Provisioning Completion
    {
      id: 'wait-iam',
      name: 'Wait for IAM Roles',
      description: 'Polling for IAM role provisioning completion',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Polling IAM role provisioning status...');
        await simulateStepExecution(1500);
        
        await addLog(provisioningStateId, 'Calling DescribeProvisionedProduct to check status...');
        await simulateStepExecution(1000);
        
        await addLog(provisioningStateId, 'Status: UNDER_CHANGE (25% complete)');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'Calling DescribeProvisionedProduct to check status...');
        await simulateStepExecution(1000);
        
        await addLog(provisioningStateId, 'Status: UNDER_CHANGE (50% complete)');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'Calling DescribeProvisionedProduct to check status...');
        await simulateStepExecution(1000);
        
        await addLog(provisioningStateId, 'Status: UNDER_CHANGE (75% complete)');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'Calling DescribeProvisionedProduct to check status...');
        await simulateStepExecution(1000);
        
        await addLog(provisioningStateId, 'Status: AVAILABLE (100% complete)');
        await simulateStepExecution(500);
        
        await addLog(provisioningStateId, 'IAM role provisioning completed successfully!');
      }
    },
    
    // Step 6: Provision Core Infrastructure
    {
      id: 'provision-core',
      name: 'Core Infrastructure',
      description: 'Provisioning core VPC and networking components',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Initiating core infrastructure provisioning...');
        await simulateStepExecution(1500);
        
        await addLog(provisioningStateId, 'Calling ProvisionProduct for core-vpc...');
        await simulateStepExecution(3000);
        
        await addLog(provisioningStateId, `Creating VPC for ${config.applicationName} in ${config.environment} environment`);
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'Setting up subnets, route tables, and security groups...');
        await simulateStepExecution(3000);
        
        await addLog(provisioningStateId, 'Core VPC infrastructure provisioned successfully');
      }
    },
    
    // Step 7: Provision Service Catalog Spokes
    {
      id: 'provision-spokes',
      name: 'Service Catalog Spokes',
      description: 'Provisioning service-specific infrastructure components',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Initiating Service Catalog spoke provisioning...');
        await simulateStepExecution(1500);
        
        // ECS Spoke
        await addLog(provisioningStateId, 'Calling ProvisionProduct for ecs-spoke...');
        await simulateStepExecution(3000);
        
        await addLog(provisioningStateId, `Setting up ECS cluster with ${config.containerCount} container instances`);
        await simulateStepExecution(2000);
        
        // EC2 Spoke
        await addLog(provisioningStateId, 'Calling ProvisionProduct for ec2-spoke...');
        await simulateStepExecution(3000);
        
        await addLog(provisioningStateId, `Provisioning ${config.instanceType} instances for the cluster`);
        await simulateStepExecution(2000);
        
        // Border Controls Spoke
        await addLog(provisioningStateId, 'Calling ProvisionProduct for border-controls-spoke...');
        await simulateStepExecution(3000);
        
        await addLog(provisioningStateId, 'Setting up security boundaries and network controls');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'All Service Catalog spokes provisioned successfully');
      }
    },
    
    // Step 8: Validate Infrastructure
    {
      id: 'validate-infra',
      name: 'Infrastructure Validation',
      description: 'Validating the provisioned infrastructure components',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Validating provisioned infrastructure...');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, 'Checking VPC connectivity...');
        await simulateStepExecution(1500);
        
        await addLog(provisioningStateId, 'Verifying ECS cluster status...');
        await simulateStepExecution(1500);
        
        await addLog(provisioningStateId, 'Verifying security group configurations...');
        await simulateStepExecution(1500);
        
        await addLog(provisioningStateId, 'All infrastructure components validated successfully');
      }
    },
    
    // Step 9: Final Configuration
    {
      id: 'final-config',
      name: 'Final Configuration',
      description: 'Performing final configuration and setup steps',
      execute: async function() {
        const provisioningStateId = 1;
        await addLog(provisioningStateId, 'Performing final configuration steps...');
        await simulateStepExecution(1500);
        
        await addLog(provisioningStateId, 'Setting up monitoring and logging...');
        await simulateStepExecution(2000);
        
        await addLog(provisioningStateId, `Configuring auto-scaling: ${config.autoScaling ? 'Enabled' : 'Disabled'}`);
        await simulateStepExecution(1500);
        
        await addLog(provisioningStateId, 'Applying resource tags and labels...');
        await simulateStepExecution(1500);
        
        await addLog(
          provisioningStateId, 
          `Infrastructure for '${config.applicationName}' successfully provisioned in ${config.environment} environment!`
        );
      }
    }
  ];
}

/**
 * Get step definitions for the frontend
 * @returns Array of step definitions with IDs, titles, descriptions and icons
 */
export function getInfraStepDefinitions() {
  return [
    {
      id: 'setup-auth',
      title: 'AWS Authentication Setup',
      description: 'Set up AWS region and credentials',
      icon: 'key',
    },
    {
      id: 'validate-creds',
      title: 'Validate Credentials',
      description: 'Verify AWS credentials using STS',
      icon: 'check-circle',
    },
    {
      id: 'fetch-metadata',
      title: 'Fetch Catalog Metadata',
      description: 'Retrieve Service Catalog product information',
      icon: 'database',
    },
    {
      id: 'provision-iam',
      title: 'Provision IAM Roles',
      description: 'Set up required IAM roles for infrastructure',
      icon: 'shield',
    },
    {
      id: 'wait-iam',
      title: 'Wait for IAM Roles',
      description: 'Wait for IAM role provisioning to complete',
      icon: 'clock',
    },
    {
      id: 'provision-core',
      title: 'Core Infrastructure',
      description: 'Provision VPC and core networking components',
      icon: 'server',
    },
    {
      id: 'provision-spokes',
      title: 'Service Catalog Spokes',
      description: 'Provision service-specific components',
      icon: 'git-branch',
    },
    {
      id: 'validate-infra',
      title: 'Validate Infrastructure',
      description: 'Verify all infrastructure components',
      icon: 'check',
    },
    {
      id: 'final-config',
      title: 'Final Configuration',
      description: 'Apply final configuration settings',
      icon: 'settings',
    }
  ];
}