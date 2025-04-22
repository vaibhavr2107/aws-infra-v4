import React, { useEffect, useRef } from "react";
import { ProvisioningLog } from "@/lib/types";

interface ActivityMonitorProps {
  logs: ProvisioningLog[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

const ActivityMonitor: React.FC<ActivityMonitorProps> = ({ logs, status }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when logs change
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);
  
  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Awaiting deployment';
      case 'in-progress':
        return 'Provisioning in progress';
      case 'completed':
        return 'Provisioning completed';
      case 'failed':
        return 'Provisioning failed';
      default:
        return 'Unknown status';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Activity Monitor</h2>
        <div className="text-sm text-gray-500">
          <span id="activity-status">{getStatusText()}</span>
        </div>
      </div>
      
      <div 
        ref={logContainerRef}
        className="bg-gray-50 rounded-md p-4 h-64 overflow-y-auto scrollbar-hide font-mono text-sm"
      >
        {logs.length === 0 ? (
          <>
            <div className="text-gray-500 mb-2">// Logs will appear here during provisioning</div>
            <div className="text-gray-500">// Click "Start Provisioning" to begin</div>
          </>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="text-gray-700 mb-1">
              [{log.timestamp}] {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityMonitor;
