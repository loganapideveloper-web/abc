import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema, cancelOrderSchema } from '../validators/order.validator';

const router = Router();

// All order routes are protected
router.use(authenticate);

// User routes
router.post('/', validate(createOrderSchema), orderController.create);
router.get('/', orderController.getAll);
router.get('/:id', orderController.getById);
router.put('/:id/cancel', validate(cancelOrderSchema), orderController.cancel);
router.get('/:id/track', orderController.trackOrder);

// Admin routes
router.get('/admin/all', isAdmin, orderController.getAllOrders);
router.put('/admin/:id/status', isAdmin, validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
