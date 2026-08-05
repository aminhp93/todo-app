import { Router } from 'express';
import * as todoController from '../controllers/todo.controller';
import { authenticateSession } from '../middleware/authenticateSession';
import { validateBody } from '../middleware/validate';
import { createTodoSchema, updateTodoSchema } from '../schemas/todo.schema';

// Identical CRUD surface to routes/todo.routes.ts, but gated by
// authenticateSession instead of authenticateJwt — same controller/service/
// repository stack, different auth strategy, so the two patterns can be
// compared directly: POST /api/session-auth/login then hit these with the
// session cookie, vs POST /api/auth/login then hit /api/todos with a Bearer
// token.
const router = Router();

router.use(authenticateSession);

router.get('/stats', todoController.stats);
router.get('/', todoController.list);
router.post('/', validateBody(createTodoSchema), todoController.create);
router.patch('/:id', validateBody(updateTodoSchema), todoController.update);
router.delete('/:id', todoController.remove);

export default router;
