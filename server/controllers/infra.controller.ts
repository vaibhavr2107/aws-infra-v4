import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { 
  awsCredentialsRequestSchema, 
  infraConfigSchema,
  provisioningConfigSchema
} from '@shared/schema';
import { storage } from '../storage';
import { getTemporaryCredentials } from '../services/credentials.service';
import { createInfraProvisioningSteps, getInfraStepDefinitions } from '../services/awsInfraSteps.service';
import { executeStepsSequentially } from '../utils/syncStepExecutor';
import { isDummyMode, generateMockResponse } from '../utils/config';

/**
 * Start the Infrastructure provisioning process
 */
export async function startInfraProvisioning(req: Request, res: Response) {
  try {
    // Check if dummy mode is enabled
    const dummyMode = isDummyMode();
    if (dummyMode) {
      console.log('AWS_DUMMY mode enabled: Using mocked Infrastructure provisioning');
    }

    // Validate request body
    const { credentials, config } = req.body;
    
    // Parse and validate with Zod schemas
    const validatedCredentials = awsCredentialsRequestSchema.parse(credentials);
    const validatedConfig = infraConfigSchema.parse(config);
    
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
          message: 'Initializing infrastructure provisioning in AWS_DUMMY mode (all AWS operations will be mocked)...' 
        }]
      : [{ 
          timestamp: now, 
          message: 'Initializing infrastructure provisioning...' 
        }];
        
    const provisioningState = await storage.createProvisioningState({
      userId: 1,
      infrastructureType: 'infra',
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
    
    // Create the steps to provision infrastructure
    const provisioningSteps = createInfraProvisioningSteps(awsCredentials, validatedConfig, storage);
    
    // Execute steps asynchronously (don't wait for completion)
    executeStepsSequentially(provisioningSteps, provisioningState.id, storage).catch(error => {
      console.error('Error executing provisioning steps:', error);
    });
    
    // Respond with success
    return res.status(200).json({
      success: true,
      message: dummyMode 
        ? 'Infrastructure provisioning started in AWS_DUMMY mode (mock operations)' 
        : 'Infrastructure provisioning started',
      provisioningId: provisioningState.id,
      dummyMode: dummyMode // Include dummy mode flag in response
    });
    
  } catch (error) {
    console.error('Error starting infrastructure provisioning:', error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to start infrastructure provisioning'
    });
  }
}

/**
 * Get the status of an infrastructure provisioning process
 */
export async function getInfraProvisioningStatus(req: Request, res: Response) {
  try {
    // Check if dummy mode is enabled
    const dummyMode = isDummyMode();
    if (dummyMode) {
      console.log('AWS_DUMMY mode enabled: Returning mocked provisioning status');
    }

    // In a real implementation, we'd use the ID from the request
    // For demo purposes, we're getting the latest state
    const latestState = await storage.getLatestProvisioningState();
    
    if (!latestState) {
      return res.status(404).json({
        success: false,
        message: 'No provisioning process found'
      });
    }
    
    // Transform the raw state into a more frontend-friendly format
    const status = latestState.status === 'in_progress' ? 'in-progress' : latestState.status;
    
    // Get the step definitions to include in the response
    const steps = getInfraStepDefinitions().map(step => ({
      ...step,
      status: getStepStatus(step.id, latestState)
    }));
    
    const response = {
      success: true,
      infrastructureType: latestState.infrastructureType,
      status,
      currentStep: latestState.currentStep,
      steps,
      logs: latestState.logs,
      config: {
        applicationName: latestState.applicationName,
        environment: latestState.environment,
        instanceType: latestState.instanceType,
        containerCount: latestState.containerCount,
        autoScaling: latestState.autoScaling
      },
      dummyMode // Include dummy mode flag in response
    };
    
    return res.status(200).json(dummyMode
      ? generateMockResponse(response) // Wrap in mock response format if in dummy mode
      : response
    );
    
  } catch (error) {
    console.error('Error getting provisioning status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get provisioning status'
    });
  }
}

/**
 * Get list of steps for infrastructure provisioning
 */
export function getInfraSteps(req: Request, res: Response) {
  try {
    // Check if dummy mode is enabled
    const dummyMode = isDummyMode();
    if (dummyMode) {
      console.log('AWS_DUMMY mode enabled: Returning mocked infrastructure steps');
    }
    
    const steps = getInfraStepDefinitions();
    
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
    console.error('Error getting infrastructure steps:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get infrastructure steps'
    });
  }
}

/**
 * Helper function to determine step status
 */
function getStepStatus(stepId: string, state: any): 'pending' | 'in-progress' | 'completed' | 'failed' {
  if (state.status === 'failed') {
    return 'failed';
  }
  
  if (state.currentStep === stepId) {
    return 'in-progress';
  }
  
  // Find the current step index
  const stepIds = getInfraStepDefinitions().map(step => step.id);
  const currentStepIndex = stepIds.indexOf(state.currentStep);
  const thisStepIndex = stepIds.indexOf(stepId);
  
  if (thisStepIndex < currentStepIndex || (state.status === 'completed' && thisStepIndex <= currentStepIndex)) {
    return 'completed';
  }
  
  return 'pending';
}