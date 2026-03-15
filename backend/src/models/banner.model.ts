import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  position: 'hero' | 'sidebar' | 'popup' | 'footer';
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    image: { type: String, required: true },
    link: { type: String, default: '' },
    position: { type: String, enum: ['hero', 'sidebar', 'popup', 'footer'], default: 'hero' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { transform(_doc, ret) { delete (ret as any).__v; return ret; } },
  },
);

bannerSchema.index({ isActive: 1, order: 1 });

const Banner = mongoose.model<IBanner>('Banner', bannerSchema);
export default Banner;
