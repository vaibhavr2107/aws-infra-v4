import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock, Terminal } from 'lucide-react';

interface ActivityMonitorProps {
  logs: Array<{ message: string; timestamp: string }>;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

const ActivityMonitor: React.FC<ActivityMonitorProps> = ({ logs, status }) => {
  // Status indicators
  const statusIndicator = () => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center text-green-600 mb-4">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Completed Successfully</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center text-red-600 mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Failed</span>
          </div>
        );
      case 'in-progress':
        return (
          <div className="flex items-center text-blue-600 mb-4">
            <div className="animate-spin h-5 w-5 mr-2 border-2 border-blue-600 border-t-transparent rounded-full" />
            <span className="font-medium">In Progress</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-500 mb-4">
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-medium">Waiting to Start</span>
          </div>
        );
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-lg font-medium mb-4">Activity Log</h3>
      
      {statusIndicator()}
      
      <div className="bg-gray-100 p-3 rounded-md font-mono text-xs overflow-auto max-h-80">
        {logs && logs.length > 0 ? (
          logs.map((log, index) => (
            <div key={index} className="mb-2 last:mb-0">
              <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
            </div>
          ))
        ) : (
          <div className="text-gray-500 italic">No activity logs available.</div>
        )}
      </div>
    </div>
  );
};

export default ActivityMonitor;