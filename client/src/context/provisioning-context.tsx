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
  awsCredentials: AwsCredentialsRequest;
  ecsConfig: EcsConfig;
  infraConfig?: InfraConfig;
  updateAwsCredentials: (credentials: Partial<AwsCredentialsRequest>) => void;
  updateEcsConfig: (config: Partial<EcsConfig>) => void;
  updateInfraConfig: (config: Partial<InfraConfig>) => void;
  startProvisioningProcess: () => Promise<void>;
  resetProvisioning: () => void;
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
  applicationName: '',
  environment: 'dev',
  instanceType: 't2.micro',
  containerCount: 1,
  autoScaling: false,
};

const defaultInfraConfig: InfraConfig = {
  friendlyStackName: '',
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
  const [awsCredentials, setAwsCredentials] = useState<AwsCredentialsRequest>(defaultAwsCredentials);
  const [ecsConfig, setEcsConfig] = useState<EcsConfig>(defaultEcsConfig);
  const [infraConfig, setInfraConfig] = useState<InfraConfig>(defaultInfraConfig);
  const [provisioningState, setProvisioningState] = useState<ProvisioningState>(defaultProvisioningState);
  
  // Query for provisioning status
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/ecs/status'],
    enabled: false, // Don't fetch on mount
  });
  
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
  
  // Update AWS credentials
  const updateAwsCredentials = (credentials: Partial<AwsCredentialsRequest>) => {
    setAwsCredentials(prev => ({
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
        await startInfraProvisioning(awsCredentials, infraConfig);
        
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
        await startProvisioning(awsCredentials, ecsConfig);
        
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
        awsCredentials,
        ecsConfig,
        infraConfig,
        updateAwsCredentials,
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