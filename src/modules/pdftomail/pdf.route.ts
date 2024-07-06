import express from "express";
import { PdfController } from "./pdf.controller";
import { VerifyedPdfController } from "./verifiedPdfController";
const router = express.Router();

// router.post(
//   "/generate-single-pdf-before-verification",
//   PdfController.generateSinglePdf
// );
router.post(
  "/generate-multi-pdf-before-verification",
  PdfController.generateMultiplePagePdf
);
router.post(
  "/get-pdf-after-verification",
  VerifyedPdfController.verifyedMultiplePagePdf
);

export const pdfRoute = router;
