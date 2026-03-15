import { Router } from 'express';
import categoryController from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';

const router = Router();

// Public
router.get('/', categoryController.getAll);
router.get('/:slug', categoryController.getBySlug);

// Admin
router.post('/', authenticate, isAdmin, categoryController.create);
router.put('/:id', authenticate, isAdmin, categoryController.update);
router.delete('/:id', authenticate, isAdmin, categoryController.delete);

export default router;
