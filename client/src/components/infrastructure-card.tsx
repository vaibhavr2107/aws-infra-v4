import React from "react";
import { cn } from "@/lib/utils";

interface InfrastructureCardProps {
  type: 'ecs' | 'eks';
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
  // Styles based on type
  const getTypeStyles = () => {
    if (type === 'ecs') {
      return {
        iconBg: 'bg-aws-light-blue',
        icon: 'ri-inbox-archive-line text-3xl text-aws-blue',
        footerBg: 'bg-aws-light-blue',
        footerText: 'text-aws-blue',
        footerIcon: 'ri-arrow-right-line text-aws-blue',
        actionText: 'Select ECS'
      };
    } else {
      return {
        iconBg: 'bg-aws-light-orange',
        icon: 'ri-settings-5-line text-3xl text-aws-orange',
        footerBg: 'bg-aws-light-orange',
        footerText: 'text-aws-orange',
        footerIcon: 'ri-lock-line text-aws-orange',
        actionText: 'Coming Soon'
      };
    }
  };
  
  const styles = getTypeStyles();
  
  return (
    <div 
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-sm transition-shadow overflow-hidden",
        isAvailable ? "hover:shadow-md cursor-pointer" : "opacity-75 cursor-not-allowed"
      )}
      onClick={isAvailable ? onClick : undefined}
      data-infra-type={type}
    >
      <div className="p-6 flex items-start">
        <div className={cn("p-3 rounded-lg", styles.iconBg)}>
          <i className={styles.icon}></i>
        </div>
        <div className="ml-5">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-gray-600">{description}</p>
        </div>
      </div>
      <div className={cn("px-6 py-4 border-t border-gray-100", styles.footerBg)}>
        <div className="flex justify-between items-center">
          <span className={cn("text-sm font-medium", styles.footerText)}>
            {isAvailable ? styles.actionText : 'Coming Soon'}
          </span>
          <i className={styles.footerIcon}></i>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureCard;
