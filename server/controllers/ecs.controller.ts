import { Request, Response } from 'express';
import { 
  awsCredentialsRequestSchema, 
  ecsConfigSchema,
  provisioningConfigSchema 
} from '@shared/schema';
import { storage } from '../storage';
import { ZodError } from 'zod';
import { createEcsProvisioningSteps, getEcsStepDefinitions } from '../services/awsEcsSteps.service';
import { executeStepsSequentially } from '../utils/syncStepExecutor';
import { getTemporaryCredentials } from '../services/credentials.service';
import { isDummyMode, generateMockResponse } from '../utils/config';

/**
 * Start the ECS provisioning process
 */
export async function startEcsProvisioning(req: Request, res: Response) {
  try {
    // Check if dummy mode is enabled
    const dummyMode = isDummyMode();
    if (dummyMode) {
      console.log('AWS_DUMMY mode enabled: Using mocked ECS provisioning');
    }

    // Validate request body
    const { credentials, config } = req.body;
    
    // Parse and validate with Zod schemas
    const validatedCredentials = awsCredentialsRequestSchema.parse(credentials);
    const validatedConfig = ecsConfigSchema.parse(config);
    
    // Get AWS temporary credentials
    const awsCredentials = await getTemporaryCredentials(
      validatedCredentials.username,
      validatedCredentials.password
    );
    
    if (!awsCredentials) {
      return res.status(401).json({
        success: false,
        message: 'Invalid AWS credentials'
      });
    }
    
    // Store AWS credentials
    const storedCredentials = await storage.storeAwsCredentials({
      userId: 1, // For demo purposes, we're using a fixed user ID
      accessKeyId: awsCredentials.accessKeyId,
      secretAccessKey: awsCredentials.secretAccessKey,
      sessionToken: awsCredentials.sessionToken,
      expiresAt: awsCredentials.expiresAt
    });
    
    // Create an initial provisioning state
    const now = new Date().toISOString();
    const initialLogs = dummyMode 
      ? [{ 
          timestamp: now, 
          message: 'Initializing ECS provisioning in AWS_DUMMY mode (all AWS operations will be mocked)...' 
        }]
      : [{ 
          timestamp: now, 
          message: 'Initializing ECS provisioning...' 
        }];

    const provisioningState = await storage.createProvisioningState({
      userId: 1,
      infrastructureType: 'ecs',
      status: 'pending',
      currentStep: null,
      applicationName: validatedConfig.applicationName,
      environment: validatedConfig.environment,
      instanceType: validatedConfig.instanceType,
      containerCount: validatedConfig.containerCount,
      autoScaling: validatedConfig.autoScaling,
      logs: initialLogs,
      createdAt: now,
      updatedAt: now
    });
    
    // Create the steps to provision ECS infrastructure
    const provisioningSteps = createEcsProvisioningSteps(awsCredentials, validatedConfig, storage);
    
    // Execute steps asynchronously (don't wait for completion)
    executeStepsSequentially(provisioningSteps, provisioningState.id, storage).catch(error => {
      console.error('Error executing provisioning steps:', error);
    });
    
    // Respond with success
    return res.status(200).json({
      success: true,
      message: dummyMode 
        ? 'ECS provisioning started in AWS_DUMMY mode (mock operations)'
        : 'ECS provisioning started',
      provisioningId: provisioningState.id,
      dummyMode: dummyMode // Include dummy mode flag in response
    });
    
  } catch (error) {
    console.error('Error starting ECS provisioning:', error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to start ECS provisioning'
    });
  }
}

/**
 * Get the status of an ECS provisioning process
 */
export async function getEcsProvisioningStatus(req: Request, res: Response) {
  try {
    // Check if dummy mode is enabled
    const dummyMode = isDummyMode();
    if (dummyMode) {
      console.log('AWS_DUMMY mode enabled: Returning mocked ECS provisioning status');
    }
    
    // Get the latest provisioning state
    const latestState = await storage.getLatestProvisioningState();
    
    if (!latestState) {
      return res.status(404).json({
        success: false,
        message: 'No provisioning process found'
      });
    }
    
    // Get logs from state - they're already a JSONB object
    const logs = latestState.logs || [];
    
    // Get step definitions
    const stepDefinitions = getEcsStepDefinitions();
    
    // Create step status array with current status
    const steps = stepDefinitions.map(step => ({
      ...step,
      status: getStepStatus(step.id, latestState)
    }));
    
    // Create config object from state properties
    const config = {
      applicationName: latestState.applicationName,
      environment: latestState.environment,
      instanceType: latestState.instanceType,
      containerCount: latestState.containerCount,
      autoScaling: latestState.autoScaling
    };
    
    const response = {
      success: true,
      status: latestState.status,
      currentStep: latestState.currentStep,
      infrastructureType: latestState.infrastructureType,
      steps,
      logs,
      config,
      dummyMode // Include dummy mode flag in response
    };
    
    return res.status(200).json(dummyMode
      ? generateMockResponse(response) // Wrap in mock response format if in dummy mode
      : response
    );
    
  } catch (error) {
    console.error('Error getting ECS provisioning status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get ECS provisioning status'
    });
  }
}

/**
 * Get list of steps for ECS provisioning
 */
export function getEcsSteps(req: Request, res: Response) {
  try {
    // Check if dummy mode is enabled
    const dummyMode = isDummyMode();
    if (dummyMode) {
      console.log('AWS_DUMMY mode enabled: Returning mocked ECS steps');
    }
    
    const steps = getEcsStepDefinitions();
    
    const response = {
      success: true,
      steps,
      dummyMode // Include dummy mode flag in response
    };
    
    return res.status(200).json(dummyMode
      ? generateMockResponse(response) // Wrap in mock response format if in dummy mode
      : response
    );
  } catch (error) {
    console.error('Error getting ECS steps:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get ECS steps'
    });
  }
}

/**
 * Helper function to determine step status
 */
function getStepStatus(stepId: string, state: any): 'pending' | 'in-progress' | 'completed' | 'failed' {
  if (state.status === 'failed' && state.currentStep === stepId) {
    return 'failed';
  }
  
  if (state.currentStep === stepId && state.status === 'in-progress') {
    return 'in-progress';
  }
  
  // Find which step we're on in the sequence
  const stepOrder = [
    'authentication',
    'validate-credentials',
    'fetch-catalog',
    'provision-iam',
    'wait-iam',
    'provision-infra',
    'wait-infra',
    'finalize'
  ];
  
  const currentStepIndex = stepOrder.indexOf(state.currentStep || '');
  const thisStepIndex = stepOrder.indexOf(stepId);
  
  if (thisStepIndex < currentStepIndex || 
      (state.status === 'completed' && thisStepIndex <= currentStepIndex)) {
    return 'completed';
  }
  
  return 'pending';
}