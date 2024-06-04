import express from "express";
import { OtpController } from "./otp.controller";
const router = express.Router();

router.post("/otp-generate", OtpController.generateOtp);
router.post("/otp-verif", OtpController.verifyOtp);

export const OtpRoute = router;
