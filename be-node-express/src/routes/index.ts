import { Router } from 'express';
import authRoutes from './auth.routes';
import sessionAuthRoutes from './sessionAuth.routes';
import todoRoutes from './todo.routes';
import todoSessionRoutes from './todoSession.routes';
import categoryRoutes from './category.routes';

const router = Router();

router.use('/auth', authRoutes); // JWT: register/login/refresh/logout
router.use('/session-auth', sessionAuthRoutes); // session-based: login/logout/me
router.use('/todos', todoRoutes); // JWT-protected
router.use('/session-todos', todoSessionRoutes); // session-protected (same CRUD surface)
router.use('/categories', categoryRoutes);

export default router;
