import Order from '../models/order.model';
import User from '../models/user.model';
import Product from '../models/product.model';

class AdminService {
  async getDashboardAnalytics() {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      recentOrders,
      orderStatusCounts,
      lowStockProducts,
      thisMonthUsers,
      lastMonthUsers,
      thisMonthOrders,
      lastMonthOrders,
      thisMonthRevenue,
      lastMonthRevenue,
      thisMonthProducts,
      lastMonthProducts,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email')
        .lean(),
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      ]),
      Product.find({ $and: [{ stock: { $lte: 5 } }, { stock: { $gt: 0 } }] })
        .select('name stock thumbnail price')
        .sort({ stock: 1 })
        .limit(10)
        .lean(),
      User.countDocuments({ role: 'user', createdAt: { $gte: thisMonthStart } }),
      User.countDocuments({ role: 'user', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      Order.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      Order.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Product.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      Product.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const calcGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const thisRevenue = thisMonthRevenue[0]?.total || 0;
    const lastRevenue = lastMonthRevenue[0]?.total || 0;

    // Status counts as object
    const statusMap: Record<string, number> = {};
    orderStatusCounts.forEach((s: any) => {
      statusMap[s._id] = s.count;
    });

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      revenueGrowth: calcGrowth(thisRevenue, lastRevenue),
      ordersGrowth: calcGrowth(thisMonthOrders, lastMonthOrders),
      productsGrowth: calcGrowth(thisMonthProducts, lastMonthProducts),
      usersGrowth: calcGrowth(thisMonthUsers, lastMonthUsers),
      recentOrders,
      orderStatusCounts: statusMap,
      lowStockProducts,
    };
  }

  async getSalesReport(startDate?: string, endDate?: string) {
    const match: any = { paymentStatus: 'paid' };

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const report = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
    ]);

    // Summary
    const summary = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
          totalDiscount: { $sum: '$discount' },
        },
      },
    ]);

    return {
      dailyReport: report,
      summary: summary[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalDiscount: 0 },
    };
  }

  async getMonthlyRevenue(year?: number) {
    const targetYear = year || new Date().getFullYear();

    const monthly = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: {
            $gte: new Date(`${targetYear}-01-01`),
            $lte: new Date(`${targetYear}-12-31T23:59:59`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Fill all 12 months
    const months = Array.from({ length: 12 }, (_, i) => {
      const found = monthly.find((m: any) => m._id.month === i + 1);
      return {
        month: i + 1,
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
      };
    });

    return { year: targetYear, months };
  }

  async getTopProducts(limit: number = 10) {
    return Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          totalRevenue: 1,
          'product.name': 1,
          'product.thumbnail': 1,
          'product.price': 1,
          'product.slug': 1,
        },
      },
    ]);
  }
}

export default new AdminService();
