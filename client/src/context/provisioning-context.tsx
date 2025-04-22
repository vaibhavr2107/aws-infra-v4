import { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  ProvisioningState, 
  AwsCredentialsRequest, 
  EcsConfig, 
  ProvisioningLog, 
  ProvisioningStep,
  StepStatus
} from '@/lib/types';
import { 
  getAwsCredentials, 
  startProvisioning, 
  getProvisioningStatus,
  ecsSteps,
  formatLog
} from '@/lib/aws-service-utils';

// Define context type
interface ProvisioningContextType {
  provisioningState: ProvisioningState;
  isLoading: boolean;
  awsCredentials: AwsCredentialsRequest;
  ecsConfig: EcsConfig;
  updateAwsCredentials: (credentials: Partial<AwsCredentialsRequest>) => void;
  updateEcsConfig: (config: Partial<EcsConfig>) => void;
  startProvisioningProcess: () => Promise<void>;
  resetProvisioning: () => void;
  currentPage: 'landing' | 'ecs' | 'eks';
  navigateTo: (page: 'landing' | 'ecs' | 'eks') => void;
}

// Create context
const ProvisioningContext = createContext<ProvisioningContextType | undefined>(undefined);

// Provider component
export const ProvisioningProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<'landing' | 'ecs' | 'eks'>('landing');
  
  // Initialize state with default values
  const [provisioningState, setProvisioningState] = useState<ProvisioningState>({
    infrastructureType: 'ecs',
    status: 'pending',
    currentStep: null,
    steps: ecsSteps,
    logs: []
  });
  
  const [awsCredentials, setAwsCredentials] = useState<AwsCredentialsRequest>({
    username: '',
    password: ''
  });
  
  const [ecsConfig, setEcsConfig] = useState<EcsConfig>({
    applicationName: '',
    environment: 'dev',
    instanceType: 't2.micro',
    containerCount: 2,
    autoScaling: false
  });
  
  // Update AWS credentials
  const updateAwsCredentials = useCallback((credentials: Partial<AwsCredentialsRequest>) => {
    setAwsCredentials((prev) => ({ ...prev, ...credentials }));
  }, []);
  
  // Update ECS config
  const updateEcsConfig = useCallback((config: Partial<EcsConfig>) => {
    setEcsConfig((prev) => ({ ...prev, ...config }));
  }, []);
  
  // Start provisioning process
  const startProvisioningProcess = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Add initial log
      addLog("Starting provisioning process...");
      addLog(`Application: ${ecsConfig.applicationName}`);
      addLog(`Environment: ${ecsConfig.environment}`);
      
      // Update state to in-progress
      setProvisioningState(prev => ({
        ...prev,
        status: 'in-progress',
        currentStep: 'authentication',
        steps: prev.steps.map(step => 
          step.id === 'authentication' 
            ? { ...step, status: 'in-progress' as StepStatus } 
            : step
        )
      }));
      
      // Start provisioning on the backend
      const response = await startProvisioning(
        'ecs',
        awsCredentials,
        ecsConfig
      );
      
      if (response.success) {
        addLog(`Provisioning initiated: ${response.message}`);
        
        // Start polling for status updates
        pollProvisioningStatus();
      } else {
        throw new Error(response.message || 'Failed to start provisioning');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      addLog(`Error: ${errorMessage}`);
      toast({
        title: "Provisioning Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      setProvisioningState(prev => ({
        ...prev,
        status: 'failed',
      }));
    } finally {
      setIsLoading(false);
    }
  }, [awsCredentials, ecsConfig, toast]);
  
  // Function to poll for status updates
  const pollProvisioningStatus = useCallback(async () => {
    try {
      const statusResponse = await getProvisioningStatus();
      
      // Update state with new status
      setProvisioningState(prev => ({
        ...prev,
        status: statusResponse.status,
        currentStep: statusResponse.currentStep,
        steps: statusResponse.steps,
        logs: [...prev.logs, ...statusResponse.logs.filter(log => 
          !prev.logs.some(existingLog => 
            existingLog.timestamp === log.timestamp && existingLog.message === log.message
          )
        )]
      }));
      
      // Continue polling if still in progress
      if (statusResponse.status === 'in-progress') {
        setTimeout(pollProvisioningStatus, 2000);
      } else if (statusResponse.status === 'completed') {
        addLog("Provisioning completed successfully!");
        toast({
          title: "Success",
          description: "Infrastructure provisioning completed successfully!",
        });
      } else if (statusResponse.status === 'failed') {
        toast({
          title: "Provisioning Failed",
          description: "There was an error during provisioning. Check logs for details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error checking provisioning status';
      addLog(`Error: ${errorMessage}`);
    }
  }, [toast]);
  
  // Helper to add logs
  const addLog = useCallback((message: string) => {
    const newLog = formatLog(message);
    setProvisioningState(prev => ({
      ...prev,
      logs: [...prev.logs, newLog]
    }));
  }, []);
  
  // Reset provisioning state
  const resetProvisioning = useCallback(() => {
    setProvisioningState({
      infrastructureType: 'ecs',
      status: 'pending',
      currentStep: null,
      steps: ecsSteps,
      logs: []
    });
    
    setAwsCredentials({
      username: '',
      password: ''
    });
    
    setEcsConfig({
      applicationName: '',
      environment: 'dev',
      instanceType: 't2.micro',
      containerCount: 2,
      autoScaling: false
    });
  }, []);
  
  // Navigation function
  const navigateTo = useCallback((page: 'landing' | 'ecs' | 'eks') => {
    if (provisioningState.status === 'in-progress' && page === 'landing') {
      if (window.confirm("Going back will reset your provisioning progress. Continue?")) {
        resetProvisioning();
        setCurrentPage(page);
      }
    } else {
      setCurrentPage(page);
    }
  }, [provisioningState.status, resetProvisioning]);
  
  return (
    <ProvisioningContext.Provider
      value={{
        provisioningState,
        isLoading,
        awsCredentials,
        ecsConfig,
        updateAwsCredentials,
        updateEcsConfig,
        startProvisioningProcess,
        resetProvisioning,
        currentPage,
        navigateTo
      }}
    >
      {children}
    </ProvisioningContext.Provider>
  );
};

// Hook to use the provisioning context
export const useProvisioning = () => {
  const context = useContext(ProvisioningContext);
  if (context === undefined) {
    throw new Error('useProvisioning must be used within a ProvisioningProvider');
  }
  return context;
};
