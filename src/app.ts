import express, { Application, Request, Response } from "express";
import cors from "cors";
import { OtpRoute } from "./modules/otp/otp.route";
import { emailOtpRoute } from "./modules/singleoptforemail/emailotp.route";
import { pdfRoute } from "./modules/pdftomail/pdf.route";
import config from "./config";
const app: Application = express();

app.use(express.json());
app.use(cors());

app.use("/api", OtpRoute);
app.use("/api/email", emailOtpRoute);
app.use("/api/pdf", pdfRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Not Found Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err: any, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
  });
});

export default app;
