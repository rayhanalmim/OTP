import express from "express";
import { PdfController } from "./pdf.controller";
import { VerifyedPdfController } from "./verifiedPdfController";
import { SecondPdfController } from "./secondPdf";
const router = express.Router();

router.post(
  "/generate-multi-pdf-before-verification",
  PdfController.generateMultiplePagePdf
);
router.post(
  "/get-pdf-after-verification",
  VerifyedPdfController.verifyedMultiplePagePdf
);

router.post("/get-second-pdf", SecondPdfController.secondPdf);

export const pdfRoute = router;
