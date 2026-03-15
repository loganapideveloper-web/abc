import { Router } from 'express';
import bannerController from '../controllers/banner.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';

const router = Router();

// Public
router.get('/', bannerController.getAll);

// Admin
router.get('/admin', authenticate, isAdmin, bannerController.getAllAdmin);
router.post('/', authenticate, isAdmin, bannerController.create);
router.put('/:id', authenticate, isAdmin, bannerController.update);
router.delete('/:id', authenticate, isAdmin, bannerController.delete);

export default router;
