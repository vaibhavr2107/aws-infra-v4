import React from 'react';
import { SiAmazonecs, SiKubernetes, SiAmazon } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface InfrastructureCardProps {
  type: 'ecs' | 'eks' | 'infra';
  title: string;
  description: string;
  isAvailable?: boolean;
  onClick: () => void;
}

const InfrastructureCard: React.FC<InfrastructureCardProps> = ({
  type,
  title,
  description,
  isAvailable = true,
  onClick
}) => {
  // Determine icon based on type
  let IconComponent;
  if (type === 'ecs') {
    IconComponent = SiAmazonecs;
  } else if (type === 'eks') {
    IconComponent = SiKubernetes;
  } else {
    IconComponent = SiAmazon;
  }
  
  return (
    <Card className={cn(
      "flex flex-col",
      isAvailable ? "bg-white" : "bg-gray-100 opacity-60"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-center h-14 mb-2">
          <IconComponent size={48} className={cn(
            type === 'ecs' || type === 'infra' ? "text-aws-blue" : "text-blue-600"
          )} />
        </div>
        <CardTitle className="text-xl font-semibold text-center">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 text-center">
          {description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-center pt-4">
        <Button
          onClick={onClick}
          variant={isAvailable ? "default" : "secondary"}
          disabled={!isAvailable}
          className={cn(
            "w-full",
            (type === 'ecs' || type === 'infra') ? "bg-aws-blue hover:bg-aws-blue/90" : ""
          )}
        >
          {isAvailable ? "Start Provisioning" : "Coming Soon"}
        </Button>
        {!isAvailable && (
          <div className="absolute top-4 right-4 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-md">
            Coming Soon
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default InfrastructureCard;