import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discount: { type: Number, required: true, min: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { transform(_doc, ret) { delete (ret as any).__v; return ret; } },
  },
);

couponSchema.index({ code: 1, isActive: 1 });

const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
export default Coupon;
