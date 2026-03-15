import { Router } from 'express';
import cartController from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { addToCartSchema, updateCartItemSchema, applyCouponSchema } from '../validators/cart.validator';

const router = Router();

// All cart routes are protected
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/add', validate(addToCartSchema), cartController.addItem);
router.put('/item/:itemId', validate(updateCartItemSchema), cartController.updateQuantity);
router.delete('/item/:itemId', cartController.removeItem);
router.delete('/clear', cartController.clearCart);
router.post('/coupon', validate(applyCouponSchema), cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);

export default router;
