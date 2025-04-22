import React from 'react';
import { useLocation } from 'wouter';
import { useProvisioning } from '@/context/provisioning-context';
import Landing from '@/pages/landing';
import EcsDashboard from '@/pages/ecs-dashboard';
import InfraDashboard from '@/pages/infra-dashboard';

const AppRouter: React.FC = () => {
  const { currentPage } = useProvisioning();
  const [, setLocation] = useLocation();

  // Effect to sync the currentPage state with the URL location
  React.useEffect(() => {
    // Map currentPage to URL paths
    const pathMap: Record<string, string> = {
      'landing': '/',
      'ecs': '/dashboard/ecs',
      'eks': '/dashboard/eks',
      'infra': '/dashboard/infra'
    };

    // Set the location based on currentPage
    setLocation(pathMap[currentPage]);
  }, [currentPage, setLocation]);

  // Render appropriate component based on currentPage
  if (currentPage === 'ecs') {
    return <EcsDashboard />;
  } else if (currentPage === 'infra') {
    return <InfraDashboard />;
  }

  // Default to landing
  return <Landing />;
};

export default AppRouter;