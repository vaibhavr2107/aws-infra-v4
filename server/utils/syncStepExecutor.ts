import { IStorage } from '../storage';

/**
 * Step interface for defining provisioning steps
 */
export interface ProvisioningStep {
  id: string;
  name: string;
  description: string;
  execute: () => Promise<void>;
}

/**
 * Result from a step execution
 */
export interface StepResult {
  stepId: string;
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * Executes provisioning steps one after another in sequence
 * @param steps Array of provisioning steps to execute
 * @param provisioningId ID of the provisioning process
 * @param storage Storage interface for persisting logs
 * @returns Promise that resolves when all steps are complete
 */
export async function executeStepsSequentially(
  steps: ProvisioningStep[],
  provisioningId: number,
  storage: IStorage
): Promise<void> {
  try {
    // Update state to in-progress
    await storage.updateProvisioningState(provisioningId, {
      status: 'in-progress'
    });
    
    // Add log entry for starting the process
    await storage.addProvisioningLog(
      provisioningId,
      `Starting provisioning process with ${steps.length} steps...`
    );
    
    // Execute each step in sequence
    for (const step of steps) {
      // Update the current step
      await storage.updateProvisioningState(provisioningId, {
        currentStep: step.id
      });
      
      // Add log entry for starting the step
      await storage.addProvisioningLog(
        provisioningId,
        `Starting step: ${step.name} - ${step.description}`
      );
      
      try {
        // Execute the step
        await step.execute();
        
        // Create success result
        const result: StepResult = {
          stepId: step.id,
          success: true,
          message: `Successfully completed step: ${step.name}`,
          timestamp: new Date().toISOString()
        };
        
        // Add log entry for successful step
        await storage.addProvisioningLog(
          provisioningId,
          `✅ ${result.message}`
        );
        
      } catch (error) {
        // Create failed result
        const result: StepResult = {
          stepId: step.id,
          success: false,
          message: `Failed to complete step: ${step.name} - ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date().toISOString()
        };
        
        // Add log entry for failed step
        await storage.addProvisioningLog(
          provisioningId,
          `❌ ${result.message}`
        );
        
        // Update state to failed
        await storage.updateProvisioningState(provisioningId, {
          status: 'failed'
        });
        
        // Stop execution
        throw error;
      }
    }
    
    // All steps completed successfully, update state to completed
    await storage.updateProvisioningState(provisioningId, {
      status: 'completed'
    });
    
    // Add log entry for successful completion
    await storage.addProvisioningLog(
      provisioningId,
      'Provisioning process completed successfully! 🎉'
    );
    
  } catch (error) {
    console.error('Error executing steps sequentially:', error);
    
    // Ensure the provisioning state is marked as failed
    await storage.updateProvisioningState(provisioningId, {
      status: 'failed'
    });
    
    // Add log entry for overall failure
    await storage.addProvisioningLog(
      provisioningId,
      `❌ Provisioning process failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}