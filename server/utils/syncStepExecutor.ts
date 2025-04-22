import { IStorage } from "../storage";

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
): Promise<StepResult[]> {
  const results: StepResult[] = [];
  
  try {
    // Process each step sequentially
    for (const step of steps) {
      // Update current step
      await storage.updateProvisioningState(provisioningId, {
        currentStep: step.id,
        updatedAt: new Date().toISOString()
      });
      
      // Add log for starting step
      await storage.addProvisioningLog(
        provisioningId, 
        `Starting: ${step.name}...`
      );
      
      try {
        // Execute the step
        await step.execute();
        
        // If successful, add to results and log
        const result: StepResult = {
          stepId: step.id,
          success: true,
          message: `Completed: ${step.name}`,
          timestamp: new Date().toISOString()
        };
        
        results.push(result);
        
        // Add completed log
        await storage.addProvisioningLog(
          provisioningId, 
          result.message
        );
      } catch (error) {
        // If failed, add to results and log
        const result: StepResult = {
          stepId: step.id,
          success: false,
          message: `Failed: ${step.name} - ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString()
        };
        
        results.push(result);
        
        // Add error log
        await storage.addProvisioningLog(
          provisioningId, 
          result.message
        );
        
        // Mark provisioning as failed
        await storage.updateProvisioningState(provisioningId, {
          status: "failed",
          updatedAt: new Date().toISOString()
        });
        
        // Stop execution on first failure
        return results;
      }
    }
    
    // Mark provisioning as completed
    await storage.updateProvisioningState(provisioningId, {
      status: "completed",
      updatedAt: new Date().toISOString()
    });
    
    // Add final log
    await storage.addProvisioningLog(
      provisioningId, 
      "Provisioning completed successfully!"
    );
    
    return results;
  } catch (error) {
    // Handle any unexpected errors
    await storage.updateProvisioningState(provisioningId, {
      status: "failed",
      updatedAt: new Date().toISOString()
    });
    
    await storage.addProvisioningLog(
      provisioningId, 
      `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`
    );
    
    throw error;
  }
}