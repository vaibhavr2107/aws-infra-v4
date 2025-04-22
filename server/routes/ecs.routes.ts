import { Router } from 'express';
import * as ecsController from '../controllers/ecs.controller';

const router = Router();

// Start ECS provisioning process
router.post('/provision', ecsController.startEcsProvisioning);

// Get status of ECS provisioning
router.get('/status', ecsController.getEcsProvisioningStatus);

// Get ECS steps
router.get('/steps', ecsController.getEcsSteps);

export default router;