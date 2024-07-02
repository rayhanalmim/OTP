import { Document, model, Schema } from "mongoose";

// DemoData model without a schema
export const PdfDataModel = model<Document>(
  "pdfdata",
  new Schema({}, { strict: false })
);
