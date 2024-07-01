import { Document, model, Schema } from "mongoose";

export interface EmailOtp extends Document {
  email: string;
  emailOtp: string;
  secret: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailOtpSchema: Schema = new Schema(
  {
    email: { type: String, required: true },
    phoneOtp: { type: String },
    emailOtp: { type: String },
    secret: { type: String },
  },
  { timestamps: true }
);

export const singleEmailOtp = model<EmailOtp>("emailOtp", emailOtpSchema);
