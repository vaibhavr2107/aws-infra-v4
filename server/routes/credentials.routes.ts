import { Router } from 'express';
import * as credentialsController from '../controllers/credentials.controller';

const router = Router();

// Get temporary AWS credentials
router.post('/credentials', credentialsController.getAwsCredentials);

export default router;