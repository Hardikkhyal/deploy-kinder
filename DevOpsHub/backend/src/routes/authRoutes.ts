import { Router } from 'express';
import {
  sendOtp,
  verifyOtp,
  getIntegrations,
  connectGithub,
  connectAws,
  listAwsInstances,
  addServerInstance,
  deleteServerInstance,
  deleteGithubToken,
  deleteAwsCredential,
  register,
  loginWithPassword,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Password Auth
router.post('/register', register);
router.post('/login', loginWithPassword);

// Limit requests to OTP endpoints to prevent brute forcing
router.post('/send-otp', rateLimiter(5, 15 * 60 * 1000), sendOtp);
router.post('/verify-otp', rateLimiter(5, 15 * 60 * 1000), verifyOtp);

// Protected Integration routes
router.use(authMiddleware);
router.get('/integrations', getIntegrations);
router.post('/github', connectGithub);
router.post('/aws', connectAws);
router.get('/aws/:credId/instances', listAwsInstances);
router.post('/instances', addServerInstance);
router.delete('/instances/:id', deleteServerInstance);
router.delete('/github', deleteGithubToken);
router.delete('/aws/:credId', deleteAwsCredential);

export default router;
