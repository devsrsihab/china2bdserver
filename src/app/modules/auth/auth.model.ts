import { Schema, model, Document } from "mongoose";

export type TOtp = {
  phone: string;
  email: string;
  otp: string;
  expiresAt: Date;
  used: boolean;
};

const otpSchema = new Schema(
  {
    phone: { type: String },
    email: { type: String },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const Otp = model<TOtp>("Otp", otpSchema);
