import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  _id?: string;
  product: mongoose.Types.ObjectId;
  quantity: number;
  color?: string;
  price: number;
  totalPrice: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  coupon?: {
    code: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    maxDiscount?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    color: { type: String },
    price: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: true },
);

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: [cartItemSchema],
    totalItems: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    coupon: {
      code: { type: String },
      discount: { type: Number },
      discountType: { type: String, enum: ['percentage', 'fixed'] },
      maxDiscount: { type: Number },
    },
  },
  {
    timestamps: true,
    toJSON: { transform(_doc, ret) { delete (ret as any).__v; return ret; } },
  },
);

// user index already defined at field level (unique: true)

// Calculate totals before saving
cartSchema.pre('save', function (next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Apply coupon discount
  if (this.coupon && this.coupon.code) {
    if (this.coupon.discountType === 'percentage') {
      this.discount = Math.round((this.subtotal * this.coupon.discount) / 100);
      if (this.coupon.maxDiscount && this.discount > this.coupon.maxDiscount) {
        this.discount = this.coupon.maxDiscount;
      }
    } else {
      this.discount = this.coupon.discount;
    }
  } else {
    this.discount = 0;
  }

  // Delivery charge: free above ₹500
  this.deliveryCharge = this.subtotal > 500 ? 0 : 49;

  this.totalAmount = this.subtotal - this.discount + this.deliveryCharge;
  if (this.totalAmount < 0) this.totalAmount = 0;

  next();
});

const Cart = mongoose.model<ICart>('Cart', cartSchema);
export default Cart;
