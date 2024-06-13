import express from "express";
import { OtpController } from "./otp.controller";
const router = express.Router();

router.post("/phone-otp-generate", OtpController.generatePhoneOtp);
router.post("/email-otp-generate", OtpController.generateEmailOtp);
router.post("/otp-verify", OtpController.verifyOtp);
router.post("/insert-demo-data", OtpController.testData);

export const OtpRoute = router;
