import React from 'react';
import { useLocation } from 'wouter';
import Landing from '@/pages/landing';
import EcsDashboard from '@/pages/ecs-dashboard';
import InfraDashboard from '@/pages/infra-dashboard';
import Navbar from '@/components/navbar'; // Added import statement

const AppRouter: React.FC = () => {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {location === '/dashboard/ecs' && <EcsDashboard />}
      {location === '/dashboard/infra' && <InfraDashboard />}
      {location === '/' && <Landing />}
    </div>
  );
};

export default AppRouter;