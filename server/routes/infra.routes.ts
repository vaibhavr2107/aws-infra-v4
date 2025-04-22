import { Router } from 'express';
import { 
  startInfraProvisioning, 
  getInfraProvisioningStatus, 
  getInfraSteps 
} from '../controllers/infra.controller';

const router = Router();

// Start infrastructure provisioning
router.post('/start', startInfraProvisioning);

// Get infrastructure provisioning status
router.get('/status', getInfraProvisioningStatus);

// Get infrastructure steps
router.get('/steps', getInfraSteps);

export default router;