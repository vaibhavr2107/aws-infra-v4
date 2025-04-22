import React from 'react';
import { ProvisioningLog } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  CheckCircle2,
  X,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface ActivityMonitorProps {
  logs: ProvisioningLog[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

const ActivityMonitor: React.FC<ActivityMonitorProps> = ({ logs, status }) => {
  const statusIcons = {
    'pending': <Clock className="h-4 w-4 text-yellow-500" />,
    'in-progress': <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />,
    'completed': <CheckCircle2 className="h-4 w-4 text-green-500" />,
    'failed': <X className="h-4 w-4 text-red-500" />
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
    'completed': 'bg-green-100 text-green-800 border-green-300',
    'failed': 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Activity Log</CardTitle>
        <Badge 
          variant="outline" 
          className={`flex items-center gap-1 px-2 py-1 capitalize ${statusColors[status]}`}
        >
          {statusIcons[status]}
          <span>{status}</span>
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full rounded border p-4">
          {logs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400">
              <div className="flex flex-col items-center">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p>No activity logs yet</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className="border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
                >
                  <div className="text-xs text-gray-500">
                    {log.timestamp}
                  </div>
                  <div className="mt-1 text-sm">
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityMonitor;