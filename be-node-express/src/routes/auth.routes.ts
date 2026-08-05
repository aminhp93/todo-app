import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', authRateLimiter, authController.refresh);
router.post('/logout', authController.logout);

export default router;
