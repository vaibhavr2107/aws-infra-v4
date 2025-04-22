import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProvisioningLog } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityMonitorProps {
  logs: ProvisioningLog[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

const ActivityMonitor: React.FC<ActivityMonitorProps> = ({ 
  logs, 
  status 
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [logs]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Activity Monitor</CardTitle>
          <div className="flex items-center">
            <span 
              className={cn(
                "inline-block w-2 h-2 rounded-full mr-2", 
                status === 'in-progress' ? "bg-blue-500 animate-pulse" :
                status === 'completed' ? "bg-green-500" :
                status === 'failed' ? "bg-red-500" :
                "bg-gray-300"
              )}
            />
            <span 
              className={cn(
                "text-sm font-medium",
                status === 'in-progress' ? "text-blue-600" :
                status === 'completed' ? "text-green-600" :
                status === 'failed' ? "text-red-600" :
                "text-gray-600"
              )}
            >
              {status === 'in-progress' ? "Provisioning in progress" :
               status === 'completed' ? "Provisioning complete" :
               status === 'failed' ? "Provisioning failed" :
               "Ready to provision"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div ref={scrollAreaRef}>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4 font-mono text-sm bg-gray-50">
            {logs.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                <p>No activity to show. Start provisioning to see logs.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div key={index} className="flex">
                    <span className="text-gray-400 mr-2">[{log.timestamp}]</span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityMonitor;