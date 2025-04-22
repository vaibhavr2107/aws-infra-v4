/**
 * Step definitions for the ECS provisioning workflow
 */

export interface StepDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ecsStepDefinitions: StepDefinition[] = [
  {
    id: "authentication",
    title: "AWS Authentication",
    description: "Verify credentials and obtain temporary session token",
    icon: "lock",
  },
  {
    id: "vpc",
    title: "VPC Configuration",
    description: "Configure networking and security groups",
    icon: "globe",
  },
  {
    id: "cluster",
    title: "ECS Cluster Creation",
    description: "Provision ECS cluster with specified configuration",
    icon: "layout-grid",
  },
  {
    id: "task-definition",
    title: "Task Definition",
    description: "Configure container definitions and resource requirements",
    icon: "file-text",
  },
  {
    id: "service",
    title: "ECS Service Configuration",
    description: "Setup load balancing and auto-scaling policies",
    icon: "settings",
  },
  {
    id: "deployment",
    title: "Service Deployment",
    description: "Deploy service and verify health checks",
    icon: "rocket",
  }
];

export const eksStepDefinitions: StepDefinition[] = [
  {
    id: "authentication",
    title: "AWS Authentication",
    description: "Verify credentials and obtain temporary session token",
    icon: "lock",
  },
  {
    id: "vpc",
    title: "VPC Configuration",
    description: "Configure networking and security groups",
    icon: "globe",
  },
  {
    id: "cluster",
    title: "EKS Cluster Creation",
    description: "Provision Kubernetes control plane",
    icon: "layout-grid",
  },
  {
    id: "node-groups",
    title: "Node Groups",
    description: "Configure and deploy worker nodes",
    icon: "cpu",
  },
  {
    id: "networking",
    title: "Kubernetes Networking",
    description: "Configure network policies and load balancers",
    icon: "server",
  },
  {
    id: "addons",
    title: "Cluster Add-ons",
    description: "Install essential components and operators",
    icon: "puzzle",
  },
  {
    id: "rbac",
    title: "Access Control",
    description: "Configure RBAC policies and service accounts",
    icon: "shield",
  }
];