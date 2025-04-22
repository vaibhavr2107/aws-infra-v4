import React from 'react';
import { useLocation } from 'wouter';
import { useProvisioning } from '@/context/provisioning-context';
import Landing from '@/pages/landing';
import EcsDashboard from '@/pages/ecs-dashboard';
import InfraDashboard from '@/pages/infra-dashboard';

const AppRouter: React.FC = () => {
  const { currentPage } = useProvisioning();
  const [location] = useLocation();

  // Render appropriate component based on location
  if (location === '/dashboard/ecs') {
    return <EcsDashboard />;
  } else if (location === '/dashboard/infra') {
    return <InfraDashboard />;
  }

  // Default to landing
  return <Landing />;
};

export default AppRouter;