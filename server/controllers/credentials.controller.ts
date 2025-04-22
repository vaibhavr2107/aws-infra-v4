import { Request, Response } from 'express';
import { awsCredentialsRequestSchema } from '@shared/schema';
import { getTemporaryCredentials } from '../services/credentials.service';
import { ZodError } from 'zod';
import { isDummyMode, generateMockResponse } from '../utils/config';

/**
 * Get temporary AWS credentials
 */
export async function getAwsCredentials(req: Request, res: Response) {
  try {
    // Check if dummy mode is enabled
    const dummyMode = isDummyMode();
    if (dummyMode) {
      console.log('AWS_DUMMY mode enabled: Using mocked AWS credentials');
    }

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
    
    // Create response object
    const credentialsResponse = {
      success: true,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
        expiresAt: credentials.expiresAt
      },
      dummyMode // Include dummy mode flag in response
    };
    
    // Return credentials
    if (dummyMode) {
      console.log('Returning mock credentials response in dummy mode format');
      return res.status(200).json(generateMockResponse(credentialsResponse));
    } else {
      return res.status(200).json(credentialsResponse);
    }
    
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