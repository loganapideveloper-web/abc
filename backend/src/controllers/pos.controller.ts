import { Request, Response, NextFunction } from 'express';
import Order from '../models/order.model';
import Product from '../models/product.model';
import SiteSettings from '../models/settings.model';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendCreated, sendMessage } from '../utils/response.util';
import { notifyOrder } from '../utils/notify';
import { v4 as uuidv4 } from 'uuid';

class PosController {
  /** POST /api/admin/pos/create-order — Create a walk-in POS order */
  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const {
        items,
        customerName,
        customerPhone,
        customerEmail,
        paymentMethod,
        posDiscount,
        posDiscountType,
        notes,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return sendMessage(res, 'At least one item is required', 400);
      }

      if (!paymentMethod) {
        return sendMessage(res, 'Payment method is required', 400);
      }

      // Validate stock and build order items
      const orderItems: Array<{ product: any; quantity: number; price: number }> = [];
      let subtotal = 0;

      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity < 1) {
          return sendMessage(res, 'Each item needs productId and quantity', 400);
        }

        const product = await Product.findById(item.productId);
        if (!product) {
          return sendMessage(res, `Product not found: ${item.productId}`, 404);
        }
        if (product.stock < item.quantity) {
          return sendMessage(
            res,
            `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
            400,
          );
        }

        const price = item.price ?? product.price;
        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          price,
        });
        subtotal += price * item.quantity;
      }

      // Calculate discount
      let discount = 0;
      if (posDiscount && posDiscount > 0) {
        if (posDiscountType === 'percentage') {
          discount = Math.round((subtotal * posDiscount) / 100);
        } else {
          discount = posDiscount;
        }
        if (discount > subtotal) discount = subtotal;
      }

      // Fetch settings for GST
      const settings = await SiteSettings.findOne().lean();
      const billing = settings?.billing;
      const enableGst = billing?.enableGst ?? false;
      const gstRate = billing?.gstRate ?? 18;

      const afterDiscount = subtotal - discount;
      let gstAmount = 0;
      if (enableGst && gstRate > 0) {
        // GST is inclusive — extract from price
        // Formula: GST = Amount - (Amount * 100) / (100 + GST%)
        gstAmount = Math.round(afterDiscount - (afterDiscount * 100) / (100 + gstRate));
      }

      const totalAmount = afterDiscount; // GST is inclusive

      // Generate order number
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = uuidv4().slice(0, 6).toUpperCase();
      const orderNumber = `POS-${timestamp}-${random}`;

      // Generate invoice number
      const prefix = billing?.invoicePrefix || 'INV';
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const countToday = await Order.countDocuments({
        isWalkIn: true,
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      });
      const invoiceNumber = `${prefix}-${todayStr}-${String(countToday + 1).padStart(4, '0')}`;

      const order = await Order.create({
        orderNumber,
        user: req.user!.userId,
        items: orderItems,
        shippingAddress: {
          fullName: customerName || 'Walk-in Customer',
          phone: customerPhone || '0000000000',
          addressLine1: billing?.billingAddress || 'Counter Sale',
          city: billing?.billingCity || 'Store',
          state: billing?.billingState || 'Store',
          pincode: billing?.billingPincode || '000000',
        },
        paymentMethod: 'cod',
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        statusHistory: [
          { status: 'placed', date: new Date(), message: 'POS counter order' },
          { status: 'delivered', date: new Date(), message: `Counter sale — paid via ${paymentMethod}` },
        ],
        subtotal,
        discount,
        deliveryCharge: 0,
        totalAmount,
        isWalkIn: true,
        walkInCustomerName: customerName || 'Walk-in Customer',
        walkInCustomerPhone: customerPhone || '',
        walkInCustomerEmail: customerEmail || '',
        posPaymentMethod: paymentMethod,
        posDiscount: posDiscount || 0,
        posDiscountType: posDiscountType || 'fixed',
        gstAmount,
        gstRate: enableGst ? gstRate : 0,
        invoiceNumber,
        estimatedDelivery: new Date(),
        deliveredAt: new Date(),
      });

      // Reduce stock
      for (const item of orderItems) {
        const product = await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { new: true },
        );
        if (product && product.stock <= 0) {
          product.inStock = false;
          await product.save();
        }
      }

      // Notify admin
      notifyOrder(order.orderNumber, order.totalAmount, order._id.toString());

      // Populate and return
      const populated = await Order.findById(order._id).populate('items.product').lean();

      sendCreated(res, {
        order: populated,
        billing: billing || {},
        gstAmount,
        gstRate: enableGst ? gstRate : 0,
        invoiceNumber,
      }, 'POS order created and stock updated');
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/admin/pos/orders — Get all POS/walk-in orders */
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const search = req.query.search as string;

      const query: any = { isWalkIn: true };
      if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(escaped, 'i');
        query.$or = [
          { orderNumber: re },
          { invoiceNumber: re },
          { walkInCustomerName: re },
          { walkInCustomerPhone: re },
        ];
      }

      const [orders, total] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('items.product', 'name thumbnail price sku barcode')
          .lean(),
        Order.countDocuments(query),
      ]);

      sendSuccess(res, {
        orders,
        totalOrders: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      }, 'POS orders fetched');
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/admin/pos/today-stats — Today's POS summary */
  async getTodayStats(req: Request, res: Response, next: NextFunction) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = await Order.aggregate([
        { $match: { isWalkIn: true, createdAt: { $gte: today } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            totalDiscount: { $sum: '$discount' },
            totalGst: { $sum: '$gstAmount' },
            cashOrders: { $sum: { $cond: [{ $eq: ['$posPaymentMethod', 'cash'] }, 1, 0] } },
            cardOrders: { $sum: { $cond: [{ $eq: ['$posPaymentMethod', 'card'] }, 1, 0] } },
            upiOrders: { $sum: { $cond: [{ $eq: ['$posPaymentMethod', 'upi'] }, 1, 0] } },
            cashRevenue: { $sum: { $cond: [{ $eq: ['$posPaymentMethod', 'cash'] }, '$totalAmount', 0] } },
            cardRevenue: { $sum: { $cond: [{ $eq: ['$posPaymentMethod', 'card'] }, '$totalAmount', 0] } },
            upiRevenue: { $sum: { $cond: [{ $eq: ['$posPaymentMethod', 'upi'] }, '$totalAmount', 0] } },
          },
        },
      ]);

      const result = stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        totalDiscount: 0,
        totalGst: 0,
        cashOrders: 0,
        cardOrders: 0,
        upiOrders: 0,
        cashRevenue: 0,
        cardRevenue: 0,
        upiRevenue: 0,
      };

      sendSuccess(res, result, 'Today POS stats');
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/admin/pos/billing-info — Business/GST info for receipts */
  async getBillingInfo(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SiteSettings.findOne().lean();
      sendSuccess(res, {
        billing: settings?.billing || {},
        siteName: settings?.siteName || 'AMOHA Mobiles',
        contactPhone: settings?.contactPhone || '',
        contactEmail: settings?.contactEmail || '',
        address: settings?.address || '',
      }, 'Billing info fetched');
    } catch (error) {
      next(error);
    }
  }
}

export default new PosController();
