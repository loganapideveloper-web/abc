import Coupon from '../models/coupon.model';
import { NotFoundError, BadRequestError, ConflictError } from '../errors/app-error';

class CouponService {
  async getAll() {
    return Coupon.find().sort({ createdAt: -1 }).lean();
  }

  async getByCode(code: string) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() }).lean();
    if (!coupon) throw new NotFoundError('Coupon');
    return coupon;
  }

  async validate(code: string, orderAmount: number) {
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      return { isValid: false, message: 'Invalid or expired coupon code', code, discount: 0, discountType: 'percentage' as const, minOrderAmount: 0 };
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return { isValid: false, message: 'Coupon usage limit exceeded', code, discount: 0, discountType: coupon.discountType, minOrderAmount: coupon.minOrderAmount };
    }

    if (orderAmount < coupon.minOrderAmount) {
      return { isValid: false, message: `Minimum order of ₹${coupon.minOrderAmount} required`, code, discount: 0, discountType: coupon.discountType, minOrderAmount: coupon.minOrderAmount };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderAmount * coupon.discount) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discount;
    }

    return {
      isValid: true,
      message: 'Coupon applied successfully',
      code: coupon.code,
      discount: discountAmount,
      discountType: coupon.discountType,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount,
    };
  }

  async create(data: {
    code: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    minOrderAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    expiresAt: Date;
  }) {
    const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new ConflictError('Coupon code already exists');

    return Coupon.create({ ...data, code: data.code.toUpperCase() });
  }

  async update(id: string, data: Partial<{
    discount: number;
    discountType: 'percentage' | 'fixed';
    minOrderAmount: number;
    maxDiscount: number;
    usageLimit: number;
    expiresAt: Date;
    isActive: boolean;
  }>) {
    const coupon = await Coupon.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!coupon) throw new NotFoundError('Coupon');
    return coupon;
  }

  async delete(id: string) {
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) throw new NotFoundError('Coupon');
    return coupon;
  }
}

export default new CouponService();
