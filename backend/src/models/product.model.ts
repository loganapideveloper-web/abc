import mongoose, { Schema, Document } from 'mongoose';

export interface IReview {
  _id?: string;
  user: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
}

export interface IProductSpecifications {
  display: string;
  displaySize: string;
  processor: string;
  ram: string;
  storage: string;
  expandableStorage: string;
  battery: string;
  chargingSpeed: string;
  rearCamera: string;
  frontCamera: string;
  os: string;
  network: string;
  sim: string;
  weight: string;
  dimensions: string;
  waterResistant: string;
  fingerprint: string;
  nfc: boolean;
  [key: string]: string | boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: string[];
  thumbnail: string;
  specifications: IProductSpecifications;
  stock: number;
  inStock: boolean;
  ratings: number;
  numReviews: number;
  reviews: IReview[];
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  colors: string[];
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '', trim: true },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    price: { type: Number, required: true, min: 0, index: true },
    originalPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    images: [{ type: String }],
    thumbnail: { type: String, required: true },
    specifications: {
      display: { type: String, default: '' },
      displaySize: { type: String, default: '' },
      processor: { type: String, default: '' },
      ram: { type: String, default: '', index: true },
      storage: { type: String, default: '', index: true },
      expandableStorage: { type: String, default: '' },
      battery: { type: String, default: '' },
      chargingSpeed: { type: String, default: '' },
      rearCamera: { type: String, default: '' },
      frontCamera: { type: String, default: '' },
      os: { type: String, default: '' },
      network: { type: String, default: '' },
      sim: { type: String, default: '' },
      weight: { type: String, default: '' },
      dimensions: { type: String, default: '' },
      waterResistant: { type: String, default: '' },
      fingerprint: { type: String, default: '' },
      nfc: { type: Boolean, default: false },
    },
    stock: { type: Number, required: true, default: 0, min: 0 },
    inStock: { type: Boolean, default: true, index: true },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    tags: [{ type: String, trim: true }],
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    colors: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { transform(_doc, ret) { delete (ret as any).__v; return ret; } },
  },
);

// Compound indexes for performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ price: 1, ratings: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, isTrending: 1 });

// Pre-save: auto-set inStock based on stock count
productSchema.pre('save', function (next) {
  this.inStock = this.stock > 0;
  next();
});

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
