/**
 * Service for managing AWS credentials
 */

import { AwsCredentials } from '@shared/schema';
import { isDummyMode } from '../utils/config';

/**
 * Gets temporary credentials from the organization's internal endpoint
 * In a real implementation, this would use Axios to call an internal API
 * 
 * If AWS_DUMMY=true, bypasses actual authentication verification and returns mock credentials
 * 
 * @param username User's AWS username
 * @param password User's AWS password
 * @returns Promise with AWS credentials or null if authentication failed
 */
export async function getTemporaryCredentials(
  username: string,
  password: string
): Promise<AwsCredentials | null> {
  // Always validate username/password regardless of mode
  if (!username || !password) {
    console.log('Missing username or password');
    return null;
  }

  // Check if dummy mode is enabled
  if (isDummyMode()) {
    console.log('AWS_DUMMY mode enabled: Returning mock credentials instantly');
    
    // Return mock credentials without delay
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour
    
    return {
      id: 1,
      userId: 1,
      accessKeyId: `AKIA${generateRandomString(16)}`,
      secretAccessKey: generateRandomString(32),
      sessionToken: generateRandomString(48),
      expiresAt: expiresAt.toISOString()
    };
  }
  
  // Real implementation with API call simulation
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate session token generation
  // In a real app this would come from AWS STS or an internal authentication service
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour
  
  return {
    id: 1,
    userId: 1,
    accessKeyId: `AKIA${generateRandomString(16)}`,
    secretAccessKey: generateRandomString(32),
    sessionToken: generateRandomString(48),
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * Helper function to generate random strings for mock credentials
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}