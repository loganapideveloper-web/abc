import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceRequest extends Document {
  requestNumber: string;
  user?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deviceBrand: string;
  deviceModel: string;
  serviceType: string;
  description: string;
  estimatedPrice?: number;
  finalPrice?: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    requestNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    deviceBrand: { type: String, required: true, trim: true },
    deviceModel: { type: String, required: true, trim: true },
    serviceType: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    estimatedPrice: { type: Number, min: 0 },
    finalPrice: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    adminNotes: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: { transform(_doc, ret) { delete (ret as any).__v; return ret; } },
  },
);

serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ customerEmail: 1 });
serviceRequestSchema.index({ createdAt: -1 });

const ServiceRequest = mongoose.model<IServiceRequest>('ServiceRequest', serviceRequestSchema);
export default ServiceRequest;
