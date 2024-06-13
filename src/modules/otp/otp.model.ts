import { Document, model, Schema } from "mongoose";

export interface Otp extends Document {
  phone: string;
  email: string;
  phoneOtp: string;
  emailOtp: string;
  secret: string;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema: Schema = new Schema(
  {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    phoneOtp: { type: String },
    emailOtp: { type: String },
    secret: { type: String },
  },
  { timestamps: true }
);

export const OtpModel = model<Otp>("Otp", otpSchema);

// DemoData model without a schema
export const DemoDataModel = model<Document>(
  "DemoData",
  new Schema({}, { strict: false })
);
