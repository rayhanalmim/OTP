import express from "express";
import { OtpController } from "./otp.controller";
const router = express.Router();

router.post("/otp-generate", OtpController.generateOtp);
router.post("/otp-verif", OtpController.verifyOtp);
router.post("/insert-demo-data", OtpController.testData);

export const OtpRoute = router;
