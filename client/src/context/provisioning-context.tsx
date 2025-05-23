import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  AwsCredentialsRequest, 
  EcsConfig, 
  ProvisioningState,
  InfraConfig 
} from '@/lib/types';
import { 
  getProvisioningStatus, 
  startProvisioning, 
  ecsSteps 
} from '@/lib/aws-service-utils';
import {
  getInfraProvisioningStatus,
  startInfraProvisioning,
  infraSteps
} from '@/lib/infra-service-utils';

interface ProvisioningContextType {
  provisioningState: ProvisioningState;
  isLoading: boolean;
  
  // Separate credentials for each workflow
  ecsCredentials: AwsCredentialsRequest;
  infraCredentials: AwsCredentialsRequest;
  
  // Configurations
  ecsConfig: EcsConfig;
  infraConfig?: InfraConfig;
  
  // Updater functions
  updateEcsCredentials: (credentials: Partial<AwsCredentialsRequest>) => void;
  updateInfraCredentials: (credentials: Partial<AwsCredentialsRequest>) => void;
  updateEcsConfig: (config: Partial<EcsConfig>) => void;
  updateInfraConfig: (config: Partial<InfraConfig>) => void;
  
  // Process functions  
  startProvisioningProcess: () => Promise<void>;
  resetProvisioning: () => void;
  
  // Navigation
  currentPage: 'landing' | 'ecs' | 'eks' | 'infra';
  navigateTo: (page: 'landing' | 'ecs' | 'eks' | 'infra') => void;
}

const defaultProvisioningState: ProvisioningState = {
  infrastructureType: 'ecs',
  status: 'pending',
  currentStep: null,
  steps: ecsSteps,
  logs: [],
};

const defaultAwsCredentials: AwsCredentialsRequest = {
  username: '',
  password: '',
};

const defaultEcsConfig: EcsConfig = {
  applicationName: 'my-ecs-app',
  environment: 'dev',
  instanceType: 't2.micro',
  containerCount: 1,
  autoScaling: false,
};

const defaultInfraConfig: InfraConfig = {
  friendlyStackName: 'my-infra-stack',
  environment: 'dev',
  ecsTaskRole: true,
  provisionCoreVpc: true,
  provisionEcsSpoke: true,
  provisionEc2Spoke: true,
  provisionBorderControlSpoke: true,
  bcAdminAdGroup: 'AWS-SC-Admin-Group',
  vpcProvisioningArtifactName: 'v1.0',
  bcProvisioningArtifactName: 'v1.0',
  bcAdminAdGroupDomain: 'example.com',
  ec2SpokeProvisioningArtifactName: 'v1.0',
  ecsSpokeProvisioningArtifactName: 'v1.0',
  linuxGroup: 'LinuxAdmins',
  windowsGroup: 'WindowsAdmins',
};

const ProvisioningContext = createContext<ProvisioningContextType | undefined>(undefined);

export function ProvisioningProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState<'landing' | 'ecs' | 'eks' | 'infra'>('landing');
  // Separate credentials for each workflow type
  const [ecsCredentials, setEcsCredentials] = useState<AwsCredentialsRequest>(defaultAwsCredentials);
  const [infraCredentials, setInfraCredentials] = useState<AwsCredentialsRequest>(defaultAwsCredentials);
  
  // Config for each workflow
  const [ecsConfig, setEcsConfig] = useState<EcsConfig>(defaultEcsConfig);
  const [infraConfig, setInfraConfig] = useState<InfraConfig>(defaultInfraConfig);
  
  // Provisioning state
  const [provisioningState, setProvisioningState] = useState<ProvisioningState>(defaultProvisioningState);
  
  // Separate queries for each infrastructure type
  const ecsQuery = useQuery({
    queryKey: ['/api/ecs/status'],
    enabled: false, // Don't fetch on mount
  });
  
  const infraQuery = useQuery({
    queryKey: ['/api/infra/status'],
    enabled: false, // Don't fetch on mount
  });
  
  // Get the appropriate query based on the current page
  const activeQuery = currentPage === 'infra' ? infraQuery : ecsQuery;
  const { data, isLoading } = activeQuery;
  
  // Refetch function that uses the correct query based on current page
  const refetch = async () => {
    if (currentPage === 'infra') {
      return await infraQuery.refetch();
    } else {
      return await ecsQuery.refetch();
    }
  };
  
  // Effect to update provisioning state from query data
  useEffect(() => {
    if (data) {
      setProvisioningState(prevState => ({
        ...prevState,
        ...data,
      }));
    }
  }, [data]);
  
  // Poll for status updates when provisioning is in progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (provisioningState.status === 'in-progress') {
      interval = setInterval(() => {
        refetch();
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [provisioningState.status, refetch]);
  
  // Update ECS credentials
  const updateEcsCredentials = (credentials: Partial<AwsCredentialsRequest>) => {
    setEcsCredentials(prev => ({
      ...prev,
      ...credentials,
    }));
  };
  
  // Update Infrastructure credentials
  const updateInfraCredentials = (credentials: Partial<AwsCredentialsRequest>) => {
    setInfraCredentials(prev => ({
      ...prev,
      ...credentials,
    }));
  };
  
  // Update ECS configuration
  const updateEcsConfig = (config: Partial<EcsConfig>) => {
    setEcsConfig(prev => ({
      ...prev,
      ...config,
    }));
  };
  
  // Update Infrastructure configuration
  const updateInfraConfig = (config: Partial<InfraConfig>) => {
    setInfraConfig(prev => ({
      ...prev,
      ...config,
    }));
  };
  
  // Start provisioning process
  const startProvisioningProcess = async () => {
    try {
      if (currentPage === 'infra') {
        // Start infra provisioning with detailed config
        await startInfraProvisioning(infraCredentials, infraConfig);
        
        // Update local state with infra steps
        setProvisioningState(prev => ({
          ...prev,
          infrastructureType: 'infra',
          status: 'in-progress',
          currentStep: 'setup-auth',
          steps: infraSteps,
          config: infraConfig,
        }));
      } else {
        // Start ECS provisioning
        await startProvisioning(ecsCredentials, ecsConfig);
        
        // Update local state with ECS steps
        setProvisioningState(prev => ({
          ...prev,
          infrastructureType: 'ecs',
          status: 'in-progress',
          currentStep: 'authentication',
          steps: ecsSteps,
          config: ecsConfig,
        }));
      }
      
      // Start polling for updates
      await refetch();
      
      toast({
        title: "Provisioning Started",
        description: "Your infrastructure provisioning has started. You can monitor the progress in real-time.",
      });
    } catch (error) {
      console.error('Error starting provisioning process:', error);
      toast({
        title: "Provisioning Error",
        description: "Failed to start the provisioning process. Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Reset provisioning state
  const resetProvisioning = () => {
    const steps = currentPage === 'infra' ? infraSteps : ecsSteps;
    setProvisioningState({
      ...defaultProvisioningState,
      infrastructureType: currentPage === 'infra' ? 'infra' : 'ecs',
      steps,
    });
  };
  
  // Navigate to a different page
  const navigateTo = (page: 'landing' | 'ecs' | 'eks' | 'infra') => {
    setCurrentPage(page);
    
    // Update steps based on the selected page
    if (page === 'infra') {
      setProvisioningState(prev => ({
        ...prev,
        infrastructureType: 'infra',
        steps: infraSteps,
      }));
    } else if (page === 'ecs') {
      setProvisioningState(prev => ({
        ...prev,
        infrastructureType: 'ecs',
        steps: ecsSteps,
      }));
    }
    
    // If we're going to a provisioning page, try to get the latest state
    if (page !== 'landing') {
      refetch();
    }
  };
  
  return (
    <ProvisioningContext.Provider
      value={{
        provisioningState,
        isLoading,
        ecsCredentials,
        infraCredentials,
        ecsConfig,
        infraConfig,
        updateEcsCredentials,
        updateInfraCredentials,
        updateEcsConfig,
        updateInfraConfig,
        startProvisioningProcess,
        resetProvisioning,
        currentPage,
        navigateTo,
      }}
    >
      {children}
    </ProvisioningContext.Provider>
  );
};

// Export the context hook
export const useProvisioning = () => {
  const context = useContext(ProvisioningContext);
  
  if (context === undefined) {
    throw new Error('useProvisioning must be used within a ProvisioningProvider');
  }
  
  return context;
}