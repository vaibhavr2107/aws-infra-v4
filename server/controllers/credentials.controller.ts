import { Request, Response } from "express";
import { storage } from "../storage";
import { awsCredentialsRequestSchema } from "@shared/schema";
import { getTemporaryCredentials } from "../services/credentials.service";

/**
 * Get temporary AWS credentials
 */
export async function getAwsCredentials(req: Request, res: Response) {
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
}