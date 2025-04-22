import { Request, Response } from "express";
import { storage } from "../storage";
import { 
  awsCredentialsRequestSchema, 
  provisioningConfigSchema 
} from "@shared/schema";
import { createEcsProvisioningSteps, getEcsStepDefinitions } from "../services/awsEcsSteps.service";
import { executeStepsSequentially } from "../utils/syncStepExecutor";

/**
 * Start the ECS provisioning process
 */
export async function startEcsProvisioning(req: Request, res: Response) {
  try {
    // Extract and validate credentials
    const credentialsValidation = awsCredentialsRequestSchema.safeParse(req.body.credentials);
    
    if (!credentialsValidation.success) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid credentials data",
        errors: credentialsValidation.error.format()
      });
    }
    
    // Extract and validate config
    const configValidation = provisioningConfigSchema.safeParse(req.body.config);
    
    if (!configValidation.success) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid configuration data",
        errors: configValidation.error.format()
      });
    }
    
    const { username } = credentialsValidation.data;
    const config = configValidation.data;
    
    // Get user and stored credentials
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    const credentials = await storage.getAwsCredentialsByUserId(user.id);
    
    if (!credentials) {
      return res.status(401).json({ 
        success: false, 
        message: "No valid AWS credentials found. Please authenticate first." 
      });
    }
    
    // Create provisioning state
    const provisioningState = await storage.createProvisioningState({
      infrastructureType: 'ecs',
      applicationName: config.applicationName,
      environment: config.environment,
      instanceType: config.instanceType,
      containerCount: config.containerCount,
      autoScaling: config.autoScaling,
      status: 'in_progress',
      userId: user.id,
      currentStep: 'authentication',
      logs: [{ timestamp: new Date().toISOString(), message: "Starting provisioning process..." }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Get ECS provisioning steps
    const ecsSteps = createEcsProvisioningSteps(credentials, config);
    
    // Start async provisioning process
    executeStepsSequentially(
      ecsSteps, 
      provisioningState.id, 
      storage
    ).catch(err => {
      console.error('Error in ECS provisioning process:', err);
    });
    
    return res.status(200).json({
      success: true,
      message: "ECS provisioning started",
      provisioningId: provisioningState.id
    });
    
  } catch (error) {
    console.error("Error starting ECS provisioning:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
}

/**
 * Get the status of an ECS provisioning process
 */
export async function getEcsProvisioningStatus(req: Request, res: Response) {
  try {
    const latestProvisioningState = await storage.getLatestProvisioningState();
    
    if (!latestProvisioningState) {
      return res.status(404).json({ 
        success: false, 
        message: "No provisioning state found" 
      });
    }
    
    // Check if this is an ECS provisioning
    if (latestProvisioningState.infrastructureType !== 'ecs') {
      return res.status(400).json({
        success: false,
        message: "Latest provisioning is not an ECS provisioning"
      });
    }
    
    // Format the response
    const ecsStepDefinitions = getEcsStepDefinitions();
    
    // Map step definitions to status
    const steps = ecsStepDefinitions.map(step => ({
      ...step,
      status: getStepStatus(step.id, latestProvisioningState)
    }));
    
    // Format logs
    const logs = Array.isArray(latestProvisioningState.logs) 
      ? latestProvisioningState.logs 
      : [];
    
    return res.status(200).json({
      infrastructureType: latestProvisioningState.infrastructureType,
      status: latestProvisioningState.status,
      currentStep: latestProvisioningState.currentStep,
      steps,
      logs
    });
  } catch (error) {
    console.error("Error getting ECS provisioning status:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
}

/**
 * Get list of steps for ECS provisioning
 */
export function getEcsSteps(req: Request, res: Response) {
  try {
    const steps = getEcsStepDefinitions();
    
    return res.status(200).json({
      success: true,
      steps
    });
  } catch (error) {
    console.error("Error getting ECS steps:", error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    });
  }
}

/**
 * Helper function to determine step status
 */
function getStepStatus(stepId: string, state: any): 'pending' | 'in-progress' | 'completed' | 'failed' {
  const stepOrder = ['authentication', 'vpc', 'cluster', 'task-definition', 'service', 'deployment'];
  const currentStepIndex = stepOrder.indexOf(state.currentStep || '');
  const thisStepIndex = stepOrder.indexOf(stepId);
  
  if (state.status === 'failed') {
    return currentStepIndex === thisStepIndex ? 'failed' : 
           thisStepIndex < currentStepIndex ? 'completed' : 'pending';
  }
  
  if (thisStepIndex < currentStepIndex) {
    return 'completed';
  } else if (thisStepIndex === currentStepIndex) {
    return state.status === 'completed' ? 'completed' : 'in-progress';
  } else {
    return 'pending';
  }
}