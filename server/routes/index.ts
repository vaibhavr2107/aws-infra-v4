import type { Express } from "express";
import { createServer, type Server } from "http";
import credentialsRoutes from "./credentials.routes";
import ecsRoutes from "./ecs.routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register route modules
  app.use("/api/aws", credentialsRoutes);
  app.use("/api/ecs", ecsRoutes);

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}