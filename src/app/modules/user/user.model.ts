import { Schema, model, Document } from 'mongoose';
import { TUser, UserModel } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../config';

const USER_ROLES = ['super-admin', 'admin', 'user', 'supplier', 'manager'] as const;
const USER_STATUS = ['active', 'blocked'] as const;

const userSchema = new Schema<TUser, UserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String },
    district: { type: String },
    city: { type: String },
    emergencyNumber: { type: String },
    profileImage: { type: String },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: {
        values: USER_ROLES,
        message: `{VALUE} is not valid. Allowed: ${USER_ROLES.join(', ')}`,
      },
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: USER_STATUS,
        message: `{VALUE} is not valid. Allowed: ${USER_STATUS.join(', ')}`,
      },
      default: 'active',
      required: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date },
    isPhoneVerified: { type: Boolean, default: false },
    phoneVerifiedAt: { type: Date },
    lastLoginAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// 🔹 Pre-save: hash password if modified
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, Number(config.bcrypt_salt_rounds));
  }
  next();
});

// 🔹 Post-save: hide password
userSchema.post('save', function (doc: Document & TUser, next) {
  (doc as any).password = undefined;
  next();
});

// 🔹 Static method: find user by email
userSchema.statics.isUserExistByEmail = async function (email: string) {
  return await this.findOne({ email, isDeleted: false }).select('+password');
};

// 🔹 Static method: compare passwords
userSchema.statics.isPasswordMatch = async function (
  plainTextPassword: string,
  hashedPassword: string,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

// 🔹 Static method: is user exist with email
userSchema.statics.isUserExistByEmail = async function (email: string) {
  return (await this.findOne({ email, isDeleted: false }).select('+password')) as
    | (TUser & { password?: string })
    | null;
};

// 🔹 Static method: JWT issued before password change
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimeStamp: Date,
  jwtIssuedTimeStamp: number,
) {
  const passwordChangedTime = Math.floor(new Date(passwordChangedTimeStamp).getTime() / 1000);
  return passwordChangedTime > jwtIssuedTimeStamp;
};

// ✅ Model
export const User = model<TUser, UserModel>('User', userSchema);
