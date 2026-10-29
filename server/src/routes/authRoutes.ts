import { Router } from 'express';
import { handleRegister, handleLogin, handleGetMe, handleGoogleAuth } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.post('/google', handleGoogleAuth);
router.get('/me', requireAuth, handleGetMe);

export default router;
