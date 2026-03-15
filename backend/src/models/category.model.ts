import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  image: string;
  description: string;
  productCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    productCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { transform(_doc, ret) { delete (ret as any).__v; return ret; } },
  },
);

// slug index defined at field level; isActive standalone
categorySchema.index({ isActive: 1 });

const Category = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
