import mongoose, { Schema, Document } from 'mongoose';

export interface IImage extends Document {
  data: Buffer;
  contentType: string;
  folder: string;
  createdAt: Date;
}

const imageSchema = new Schema<IImage>(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    folder: { type: String, default: 'general' },
  },
  { timestamps: true },
);

export default mongoose.model<IImage>('Image', imageSchema);
