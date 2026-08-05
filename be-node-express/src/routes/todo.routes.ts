import { Router } from 'express';
import * as todoController from '../controllers/todo.controller';
import { authenticateJwt } from '../middleware/authenticateJwt';
import { validateBody } from '../middleware/validate';
import { createTodoSchema, updateTodoSchema } from '../schemas/todo.schema';

const router = Router();

router.use(authenticateJwt);

router.get('/stats', todoController.stats);
router.get('/', todoController.list);
router.post('/', validateBody(createTodoSchema), todoController.create);
router.patch('/:id', validateBody(updateTodoSchema), todoController.update);
router.delete('/:id', todoController.remove);

export default router;
