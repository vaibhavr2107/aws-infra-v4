
import React from 'react';
import { useProvisioning } from '@/context/provisioning-context';
import { SiAmazon } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const Navbar: React.FC = () => {
  const { navigateTo } = useProvisioning();
  const [location, setLocation] = useLocation();

  const handleNavigation = (page: string, path: string) => {
    navigateTo(page);
    setLocation(path);
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-shrink-0">
            <Button 
              variant="ghost"
              onClick={() => handleNavigation('landing', '/')}
              className="flex items-center space-x-2 text-aws-blue hover:text-aws-blue/80"
            >
              <SiAmazon className="h-8 w-8 text-aws-orange" />
              <span className="text-xl font-semibold">AWS Infrastructure Dashboard</span>
            </Button>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Button 
              variant="ghost"
              onClick={() => handleNavigation('landing', '/')}
              className={`${location === '/' ? 'bg-gray-100' : ''}`}
            >
              Home
            </Button>
            <Button 
              variant="ghost"
              onClick={() => handleNavigation('ecs', '/dashboard/ecs')}
              className={`${location === '/dashboard/ecs' ? 'bg-gray-100' : ''}`}
            >
              ECS Dashboard
            </Button>
            <Button 
              variant="ghost"
              onClick={() => handleNavigation('infra', '/dashboard/infra')}
              className={`${location === '/dashboard/infra' ? 'bg-gray-100' : ''}`}
            >
              Infrastructure
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
