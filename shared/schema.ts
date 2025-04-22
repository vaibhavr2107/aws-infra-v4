import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// AWS Credentials schema
export const awsCredentials = pgTable("aws_credentials", {
  id: serial("id").primaryKey(),
  accessKeyId: text("access_key_id").notNull(),
  secretAccessKey: text("secret_access_key").notNull(),
  sessionToken: text("session_token").notNull(),
  expiresAt: text("expires_at").notNull(), // ISO string date
  userId: integer("user_id").notNull(),
});

export const insertAwsCredentialsSchema = createInsertSchema(awsCredentials).pick({
  accessKeyId: true,
  secretAccessKey: true,
  sessionToken: true,
  expiresAt: true,
  userId: true,
});

// Provisioning state schema
export const provisioningState = pgTable("provisioning_state", {
  id: serial("id").primaryKey(),
  infrastructureType: text("infrastructure_type").notNull(), // ECS, EKS
  applicationName: text("application_name").notNull(),
  environment: text("environment").notNull(), // dev, test, staging, prod
  instanceType: text("instance_type").notNull(), // t2.micro, etc.
  containerCount: integer("container_count").notNull().default(2),
  autoScaling: boolean("auto_scaling").notNull().default(false),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, failed
  userId: integer("user_id").notNull(),
  currentStep: text("current_step"),
  logs: jsonb("logs").notNull().default({}),
  createdAt: text("created_at").notNull(), // ISO string date
  updatedAt: text("updated_at").notNull(), // ISO string date
});

export const insertProvisioningStateSchema = createInsertSchema(provisioningState).pick({
  infrastructureType: true,
  applicationName: true,
  environment: true,
  instanceType: true,
  containerCount: true,
  autoScaling: true,
  status: true,
  userId: true,
  currentStep: true,
  logs: true,
  createdAt: true,
  updatedAt: true,
});

// Create schemas for validation
export const awsCredentialsRequestSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(3),
});

export const provisioningConfigSchema = z.object({
  friendlyStackName: z.string().min(3, {
    message: "Stack name must be at least 3 characters"
  }).refine(value => /^[a-zA-Z0-9-]+$/.test(value), {
    message: "Stack name can only contain letters, numbers, and hyphens"
  }),
  environment: z.enum(["dev", "test", "prod"]),
  ecsTaskRole: z.boolean(),
  provisionCoreVpc: z.boolean(),
  provisionEcsSpoke: z.boolean(),
  provisionEc2Spoke: z.boolean(),
  provisionBorderControlSpoke: z.boolean(),
  bcAdminAdGroup: z.string().min(3, {
    message: "Admin group name must be at least 3 characters"
  }),
  vpcProvisioningArtifactName: z.string().min(1, {
    message: "VPC artifact name is required"
  }),
  bcProvisioningArtifactName: z.string().min(1, {
    message: "Border controls artifact name is required"
  }),
  bcAdminAdGroupDomain: z.string().min(3, {
    message: "Admin group domain must be at least 3 characters"
  }),
  ec2SpokeProvisioningArtifactName: z.string().min(1, {
    message: "EC2 spoke artifact name is required"
  }),
  ecsSpokeProvisioningArtifactName: z.string().min(1, {
    message: "ECS spoke artifact name is required"
  }),
  linuxGroup: z.string().min(3, {
    message: "Linux group name must be at least 3 characters"
  }),
  windowsGroup: z.string().min(3, {
    message: "Windows group name must be at least 3 characters"
  })
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type AwsCredentials = typeof awsCredentials.$inferSelect;
export type InsertAwsCredentials = z.infer<typeof insertAwsCredentialsSchema>;
export type ProvisioningState = typeof provisioningState.$inferSelect;
export type InsertProvisioningState = z.infer<typeof insertProvisioningStateSchema>;
export type AwsCredentialsRequest = z.infer<typeof awsCredentialsRequestSchema>;
export type ProvisioningConfig = z.infer<typeof provisioningConfigSchema>;
