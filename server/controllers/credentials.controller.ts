import { Request, Response } from 'express';
import { awsCredentialsRequestSchema } from '@shared/schema';
import { getTemporaryCredentials } from '../services/credentials.service';
import { ZodError } from 'zod';

/**
 * Get temporary AWS credentials
 */
export async function getAwsCredentials(req: Request, res: Response) {
  try {
    // Validate request body using Zod schema
    const validatedData = awsCredentialsRequestSchema.parse(req.body);
    
    // Get temporary credentials from the service
    const credentials = await getTemporaryCredentials(
      validatedData.username,
      validatedData.password
    );
    
    if (!credentials) {
      return res.status(401).json({
        success: false,
        message: 'Invalid AWS credentials'
      });
    }
    
    // Return credentials
    return res.status(200).json({
      success: true,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
        expiresAt: credentials.expiresAt
      }
    });
    
  } catch (error) {
    console.error('Error getting AWS credentials:', error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to get AWS credentials'
    });
  }
}