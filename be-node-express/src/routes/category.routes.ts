import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticateJwt } from '../middleware/authenticateJwt';
import { validateBody } from '../middleware/validate';
import { createCategorySchema } from '../schemas/todo.schema';

const router = Router();

router.use(authenticateJwt);

router.get('/', categoryController.list);
router.post('/', validateBody(createCategorySchema), categoryController.create);
router.delete('/:id', categoryController.remove);

export default router;
