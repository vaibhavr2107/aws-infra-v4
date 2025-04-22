import { Router } from "express";
import { 
  startEcsProvisioning,
  getEcsProvisioningStatus,
  getEcsSteps
} from "../controllers/ecs.controller";

const router = Router();

// Start ECS provisioning
router.post("/provision", startEcsProvisioning);

// Get ECS provisioning status
router.get("/status", getEcsProvisioningStatus);

// Get ECS steps
router.get("/steps", getEcsSteps);

export default router;