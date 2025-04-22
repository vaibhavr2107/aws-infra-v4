import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  AwsCredentialsRequest, 
  EcsConfig, 
  ProvisioningState 
} from '@/lib/types';
import { 
  getProvisioningStatus, 
  startProvisioning, 
  ecsSteps 
} from '@/lib/aws-service-utils';

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

const ProvisioningContext = createContext<ProvisioningContextType | undefined>(undefined);

export const ProvisioningProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState<'landing' | 'ecs' | 'eks'>('landing');
  const [awsCredentials, setAwsCredentials] = useState<AwsCredentialsRequest>(defaultAwsCredentials);
  const [ecsConfig, setEcsConfig] = useState<EcsConfig>(defaultEcsConfig);
  const [provisioningState, setProvisioningState] = useState<ProvisioningState>(defaultProvisioningState);
  
  // Query for provisioning status
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/provision/status'],
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
  
  // Start provisioning process
  const startProvisioningProcess = async () => {
    try {
      await startProvisioning(awsCredentials, ecsConfig);
      
      // Update local state
      setProvisioningState(prev => ({
        ...prev,
        status: 'in-progress',
        currentStep: 'authentication',
        config: ecsConfig,
      }));
      
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
    setProvisioningState(defaultProvisioningState);
  };
  
  // Navigate to a different page
  const navigateTo = (page: 'landing' | 'ecs' | 'eks') => {
    setCurrentPage(page);
    
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
        updateAwsCredentials,
        updateEcsConfig,
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

export const useProvisioning = () => {
  const context = useContext(ProvisioningContext);
  
  if (context === undefined) {
    throw new Error('useProvisioning must be used within a ProvisioningProvider');
  }
  
  return context;
};