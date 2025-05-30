/**
 * Configuration utilities for the application
 */

/**
 * Check if AWS dummy mode is enabled
 * When enabled, all AWS SDK operations will be bypassed and mock responses will be returned
 * This is useful for development and testing without interacting with real AWS services
 * 
 * For development purposes, we're setting this to true by default to make testing easier
 * In a production environment, this would be controlled via environment variables
 * 
 * @returns boolean indicating if dummy mode is enabled
 */
export function isDummyMode(): boolean {
  // Enable dummy mode by default for easier testing
  // For production, this would check process.env.AWS_DUMMY === 'true'
  return true;
}

/**
 * Generate a standard mock response for AWS operations in dummy mode
 * 
 * @param data Optional mock data to include in the response
 * @returns Mock response object
 */
export function generateMockResponse<T>(data: T = {} as T): { 
  status: string;
  message: string;
  data: T;
} {
  return {
    status: 'mock-success',
    message: 'Dummy mode enabled. No real AWS action performed.',
    data
  };
}

/**
 * Generate a random identifier for mocked AWS resources
 * 
 * @param prefix Optional prefix for the identifier
 * @returns Random AWS-like identifier
 */
export function generateMockId(prefix: string = ''): string {
  const randomId = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${randomId}`;
}