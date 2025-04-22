/**
 * ECS Provisioning Step Definitions
 * These define the steps for the ECS provisioning workflow
 */

// Step definition type
export interface StepDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// ECS provisioning steps
export const ecsStepDefinitions: StepDefinition[] = [
  {
    id: "authentication",
    title: "AWS Authentication",
    description: "Verify credentials and obtain temporary session token",
    icon: "lock"
  },
  {
    id: "vpc",
    title: "VPC Configuration",
    description: "Configure networking and security groups",
    icon: "globe"
  },
  {
    id: "cluster",
    title: "ECS Cluster Creation",
    description: "Provision ECS cluster with specified configuration",
    icon: "layout-grid"
  },
  {
    id: "task-definition",
    title: "Task Definition",
    description: "Configure container definitions and resource requirements",
    icon: "file-text"
  },
  {
    id: "service",
    title: "ECS Service Configuration",
    description: "Setup load balancing and auto-scaling policies",
    icon: "settings"
  },
  {
    id: "deployment",
    title: "Service Deployment",
    description: "Deploy service and verify health checks",
    icon: "rocket"
  }
];