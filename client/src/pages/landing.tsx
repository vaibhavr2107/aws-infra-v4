import React from "react";
import { useProvisioning } from "@/context/provisioning-context";
import InfrastructureCard from "@/components/infrastructure-card";
import { useLocation } from "wouter";

const Landing: React.FC = () => {
  const { navigateTo } = useProvisioning();
  const [_, navigate] = useLocation();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          What type of infrastructure do you want to build?
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select an infrastructure type to begin the provisioning process.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
        <InfrastructureCard
          type="ecs"
          title="Elastic Container Service"
          description="Highly secure, reliable, and scalable way to run containers."
          isAvailable={true}
          onClick={() => navigateTo('ecs')}
        />
        
        <InfrastructureCard
          type="eks"
          title="Elastic Kubernetes Service"
          description="Managed Kubernetes service to run Kubernetes in the AWS cloud."
          isAvailable={false}
          onClick={() => {}} // No action for unavailable option
        />
      </div>
      
      <div className="grid md:grid-cols-1 gap-8 max-w-4xl mx-auto">
        <InfrastructureCard
          type="infra"
          title="Service Catalog Infrastructure"
          description="Provision infrastructure using AWS Service Catalog with IAM roles, VPC, and more."
          isAvailable={true}
          onClick={() => {
            navigateTo('infra');
            navigate('/dashboard/infra');
          }}
        />
      </div>
    </div>
  );
};

export default Landing;
