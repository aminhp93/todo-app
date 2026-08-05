import { Router } from 'express';
import * as sessionAuthController from '../controllers/sessionAuth.controller';
import { validateBody } from '../middleware/validate';
import { loginSchema } from '../schemas/auth.schema';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', authRateLimiter, validateBody(loginSchema), sessionAuthController.login);
router.post('/logout', sessionAuthController.logout);
router.get('/me', sessionAuthController.me);

export default router;
