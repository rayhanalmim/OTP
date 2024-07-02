import express from "express";
import { PdfController } from "./pdf.controller";
const router = express.Router();

router.post(
  "/generate-single-pdf-before-verification",
  PdfController.generateSinglePdf
);

export const pdfRoute = router;
