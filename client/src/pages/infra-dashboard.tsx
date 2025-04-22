import React from "react";
import { useProvisioning } from "@/context/provisioning-context";
import InfraProvisioningWorkflow from "@/components/workflow/InfraProvisioningWorkflow";

const InfraDashboard: React.FC = () => {
  const { navigateTo } = useProvisioning();
  
  // Handle navigation back to landing page
  const handleBackClick = () => {
    navigateTo('landing');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <InfraProvisioningWorkflow onBack={handleBackClick} />
    </div>
  );
};

export default InfraDashboard;