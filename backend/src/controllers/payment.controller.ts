import { Response, NextFunction } from 'express';
import paymentService from '../services/payment.service';
import User from '../models/user.model';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendCreated } from '../utils/response.util';
import { notifyOrder } from '../utils/notify';
import { sendOrderConfirmationEmail } from '../utils/email.util';

class PaymentController {
  /** POST /api/payment/create-order
   *  Creates a Razorpay order and returns the order details to open the checkout modal.
   */
  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { couponCode } = req.body;
      const result = await paymentService.createRazorpayOrder(req.user!.userId, couponCode);
      sendSuccess(res, result, 'Razorpay order created');
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/payment/verify
   *  Verifies Razorpay signature and creates the confirmed order in the database.
   */
  async verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const order = await paymentService.verifyAndCreateOrder(req.user!.userId, req.body);

      // Send notification + confirmation email (same as COD flow)
      if (order) {
        notifyOrder(order.orderNumber, order.totalAmount, order._id.toString());
        const user = await User.findById(req.user!.userId).lean();
        if (user) {
          const items = (order as any).items?.map((i: any) => ({
            name: i.product?.name || 'Product',
            quantity: i.quantity,
            price: i.price,
          })) || [];
          sendOrderConfirmationEmail(user.email, user.name, {
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            items,
          }).catch((err) => console.error('Failed to send order confirmation email:', err?.message));
        }
      }

      sendCreated(res, order, 'Payment verified and order placed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
