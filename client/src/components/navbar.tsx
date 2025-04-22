import React from 'react';
import { useProvisioning } from '@/context/provisioning-context';
import { SiAmazon } from 'react-icons/si';

const Navbar: React.FC = () => {
  const { navigateTo } = useProvisioning();

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and title */}
          <div className="flex items-center flex-shrink-0">
            <button 
              onClick={() => navigateTo('landing')}
              className="flex items-center space-x-2 text-aws-blue hover:text-aws-blue/80 cursor-pointer"
            >
              <SiAmazon className="h-8 w-8 text-aws-orange" />
              <span className="text-xl font-semibold">AWS Infrastructure Dashboard</span>
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <button 
              onClick={() => navigateTo('landing')}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => navigateTo('ecs')}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              ECS Dashboard
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;