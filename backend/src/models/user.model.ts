import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  avatar?: string;
  addresses: IAddress[];
  role: 'user' | 'admin';
  isVerified: boolean;
  isBlocked: boolean;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
    type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
  },
  { _id: true },
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String },
    addresses: [addressSchema],
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiry: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).password;
        delete (ret as any).refreshToken;
        delete (ret as any).resetPasswordToken;
        delete (ret as any).resetPasswordExpiry;
        delete (ret as any).__v;
        return ret;
      },
    },
  },
);

// Indexes already defined at field level (unique/index: true)

const User = mongoose.model<IUser>('User', userSchema);
export default User;
