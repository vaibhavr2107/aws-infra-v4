import React from "react";
import { useProvisioning } from "@/context/provisioning-context";
import Landing from "@/pages/landing";
import EcsDashboard from "@/pages/ecs-dashboard";
import { useLocation, useRedirect } from "wouter";

const AppRouter: React.FC = () => {
  const { currentPage } = useProvisioning();
  const [location, setLocation] = useLocation();
  
  // Handle routing based on currentPage in context
  React.useEffect(() => {
    if (currentPage === 'ecs' && location !== '/dashboard/ecs') {
      setLocation('/dashboard/ecs');
    } else if (currentPage === 'landing' && location !== '/') {
      setLocation('/');
    }
  }, [currentPage, location, setLocation]);
  
  // Show dashboard when path is /dashboard/ecs
  if (location === '/dashboard/ecs') {
    return <EcsDashboard />;
  }
  
  // Default to landing page
  return <Landing />;
};

export default AppRouter;
