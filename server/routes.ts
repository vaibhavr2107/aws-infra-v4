import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  awsCredentialsRequestSchema, 
  provisioningConfigSchema 
} from "@shared/schema";
import { 
  getTemporaryCredentials, 
  provisionEcsInfrastructure, 
  getProvisioningStatus 
} from "./service-catalog";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get AWS Credentials API
  app.post('/api/aws/credentials', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = awsCredentialsRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid request data",
          errors: validationResult.error.format()
        });
      }
      
      const { username, password } = validationResult.data;
      
      // Get temporary credentials from internal API
      const credentials = await getTemporaryCredentials(username, password);
      
      if (!credentials) {
        return res.status(401).json({ 
          success: false, 
          message: "Failed to authenticate with AWS" 
        });
      }
      
      // Store credentials in-memory (or could be in session)
      const user = await storage.getUserByUsername(username) || 
                   await storage.createUser({ username, password });
      
      await storage.storeAwsCredentials({
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
        expiresAt: credentials.expiresAt,
        userId: user.id
      });
      
      // Return credentials to client
      return res.status(200).json({
        success: true,
        message: "Successfully obtained temporary AWS credentials",
        ...credentials
      });
      
    } catch (error) {
      console.error("Error getting AWS credentials:", error);
      return res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  // Start Provisioning API
  app.post('/api/provision/start', async (req: Request, res: Response) => {
    try {
      // Extract and validate credentials
      const credentialsValidation = awsCredentialsRequestSchema.safeParse(req.body.credentials);
      
      if (!credentialsValidation.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid credentials data",
          errors: credentialsValidation.error.format()
        });
      }
      
      // Extract and validate config
      const configValidation = provisioningConfigSchema.safeParse(req.body.config);
      
      if (!configValidation.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid configuration data",
          errors: configValidation.error.format()
        });
      }
      
      const { username } = credentialsValidation.data;
      const config = configValidation.data;
      const infrastructureType = req.body.infrastructureType || 'ecs';
      
      // Get user and stored credentials
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }
      
      const credentials = await storage.getAwsCredentialsByUserId(user.id);
      
      if (!credentials) {
        return res.status(401).json({ 
          success: false, 
          message: "No valid AWS credentials found. Please authenticate first." 
        });
      }
      
      // Create provisioning state
      const provisioningState = await storage.createProvisioningState({
        infrastructureType,
        applicationName: config.applicationName,
        environment: config.environment,
        instanceType: config.instanceType,
        containerCount: config.containerCount,
        autoScaling: config.autoScaling,
        status: 'in_progress',
        userId: user.id,
        currentStep: 'authentication',
        logs: [{ timestamp: new Date().toISOString(), message: "Starting provisioning process..." }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Start async provisioning process
      provisionEcsInfrastructure(
        credentials, 
        config, 
        provisioningState.id, 
        storage
      ).catch(err => {
        console.error('Error in provisioning process:', err);
      });
      
      return res.status(200).json({
        success: true,
        message: "Provisioning started",
        provisioningId: provisioningState.id
      });
      
    } catch (error) {
      console.error("Error starting provisioning:", error);
      return res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });
  
  // Get Provisioning Status API
  app.get('/api/provision/status', async (req: Request, res: Response) => {
    try {
      // In a real application, we would get the user from session
      // and retrieve their latest provisioning state
      const latestProvisioningState = await storage.getLatestProvisioningState();
      
      if (!latestProvisioningState) {
        return res.status(404).json({ 
          success: false, 
          message: "No provisioning state found" 
        });
      }
      
      // Format the response
      const formattedState = getProvisioningStatus(latestProvisioningState);
      
      return res.status(200).json(formattedState);
    } catch (error) {
      console.error("Error getting provisioning status:", error);
      return res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
