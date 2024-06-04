import { Document, model, Schema } from "mongoose";

export interface Otp extends Document {
  phone: string;
  email: string;
  phoneOtp: string;
  emailOtp: string;
  secret: string;
}

const otpSchema: Schema = new Schema({
  phone: { type: String, required: true },
  email: { type: String, required: true },
  phoneOtp: { type: String, required: true },
  emailOtp: { type: String, required: true },
  secret: { type: String, required: true },
});

export const OtpModel = model<Otp>("Otp", otpSchema);
