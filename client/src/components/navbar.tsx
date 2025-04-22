import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <i className="ri-cloud-line text-2xl text-aws-blue mr-2"></i>
                <span className="font-semibold text-lg">AWS Infrastructure Provisioning</span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Settings"
            >
              <i className="ri-settings-3-line text-xl"></i>
            </button>
            <button
              type="button"
              className="ml-3 p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Help"
            >
              <i className="ri-question-line text-xl"></i>
            </button>
            <div className="ml-4 relative flex items-center">
              <div className="h-8 w-8 rounded-full bg-aws-blue flex items-center justify-center text-white">
                <span className="text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
