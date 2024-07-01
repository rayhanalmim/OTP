import express from "express";
import { singleOtpController } from "./emailotp.controller";
const router = express.Router();

router.post("/single-email-otp-generate", singleOtpController.generateEmailOtp);
router.post("/single-email-otp-verify", singleOtpController.verifyOtp);

export const emailOtpRoute = router;
