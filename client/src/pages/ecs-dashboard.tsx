import React from "react";
import { useProvisioning } from "@/context/provisioning-context";
import { useToast } from "@/hooks/use-toast";
import EcsProvisioningWorkflow from "@/components/workflow/EcsProvisioningWorkflow";

const EcsDashboard: React.FC = () => {
  const { navigateTo } = useProvisioning();
  
  // Handle navigation back to landing page
  const handleBackClick = () => {
    navigateTo('landing');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <EcsProvisioningWorkflow onBack={handleBackClick} />
    </div>
  );
};

export default EcsDashboard;
