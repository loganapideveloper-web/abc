import { Request, Response, NextFunction } from 'express';
import orderService from '../services/order.service';
import User from '../models/user.model';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendCreated, sendMessage } from '../utils/response.util';
import { notifyOrder } from '../utils/notify';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../utils/email.util';

class OrderController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.create(req.user!.userId, req.body);
      if (order) {
        notifyOrder(order.orderNumber, order.totalAmount, order._id.toString());
        // Send order confirmation email
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
      sendCreated(res, order, 'Order placed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await orderService.getAll(req.user!.userId, page, limit);
      sendSuccess(res, result, 'Orders fetched');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getById(req.params.id, req.user!.userId);
      sendSuccess(res, order, 'Order fetched');
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const order = await orderService.cancel(req.params.id, req.user!.userId, reason);
      sendSuccess(res, order, 'Order cancelled');
    } catch (error) {
      next(error);
    }
  }

  async trackOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.trackOrder(req.params.id, req.user!.userId);
      sendSuccess(res, order, 'Order tracking info');
    } catch (error) {
      next(error);
    }
  }

  // Admin
  async getAllOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const source = req.query.source as string | undefined;
      const search = req.query.search as string | undefined;
      const result = await orderService.getAllOrders(page, limit, status, source, search);
      sendSuccess(res, result, 'All orders fetched');
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { orderStatus, message, trackingNumber, trackingUrl, logisticsPartner, courierAwbNumber } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, orderStatus, message);
      // Update tracking info atomically in the same operation
      if (order && (trackingNumber || trackingUrl || logisticsPartner || courierAwbNumber)) {
        const Order = (await import('../models/order.model')).default;
        const trackingUpdate: Record<string, string> = {};
        if (trackingNumber) trackingUpdate.trackingNumber = trackingNumber;
        if (trackingUrl) trackingUpdate.trackingUrl = trackingUrl;
        if (logisticsPartner) trackingUpdate.logisticsPartner = logisticsPartner;
        if (courierAwbNumber) trackingUpdate.courierAwbNumber = courierAwbNumber;
        await Order.findByIdAndUpdate(req.params.id, { $set: trackingUpdate });
      }
      // Send status update email to customer
      if (order) {
        const customer = await User.findById((order as any).user).lean();
        if (customer) {
          sendOrderStatusEmail(customer.email, customer.name, order.orderNumber, orderStatus, message).catch((err) => {
            console.error('Failed to send order status email:', err?.message);
          });
        }
      }
      sendSuccess(res, order, 'Order status updated');
    } catch (error) {
      next(error);
    }
  }

  // Public: Track order by order number & phone (for walk-in customers)
  async publicTrackOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderNumber, phone } = req.query;
      if (!orderNumber || !phone) {
        return res.status(400).json({ success: false, message: 'Order number and phone are required' });
      }
      // Validate phone format (basic sanitization)
      const phoneStr = String(phone).replace(/[^0-9+]/g, '');
      if (phoneStr.length < 10 || phoneStr.length > 15) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format' });
      }
      const Order = (await import('../models/order.model')).default;
      const order = await Order.findOne({
        orderNumber: (orderNumber as string).toUpperCase(),
        $or: [
          { 'shippingAddress.phone': phoneStr },
          { walkInCustomerPhone: phoneStr },
        ],
      }).select('orderNumber orderStatus statusHistory estimatedDelivery deliveredAt trackingNumber trackingUrl logisticsPartner totalAmount createdAt').lean();
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found. Please check your order number and phone number.' });
      }
      // Only expose limited tracking info publicly (no item details, no coupon/addresses)
      const trackingInfo = {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        statusHistory: order.statusHistory,
        estimatedDelivery: order.estimatedDelivery,
        deliveredAt: order.deliveredAt,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        logisticsPartner: order.logisticsPartner,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      };
      sendSuccess(res, trackingInfo, 'Order tracking info');
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
