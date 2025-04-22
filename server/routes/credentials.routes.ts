import { Router } from "express";
import { getAwsCredentials } from "../controllers/credentials.controller";

const router = Router();

// GET AWS credentials
router.post("/credentials", getAwsCredentials);

export default router;