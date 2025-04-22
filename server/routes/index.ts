import { Express } from 'express';
import { Server, createServer } from 'http';
import ecsRoutes from './ecs.routes';
import credentialsRoutes from './credentials.routes';

export async function registerRoutes(app: Express): Promise<Server> {
  // AWS Credentials routes
  app.use('/api/aws', credentialsRoutes);
  
  // ECS routes
  app.use('/api/ecs', ecsRoutes);
  
  // Create server without starting it - the main server/index.ts will start it
  return createServer(app);
}