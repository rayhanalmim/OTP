import { Request, Response } from "express";
import otpGenerator from "otp-generator";
import { OtpModel } from "./otp.model";
import twilio from "twilio";
import nodemailer from "nodemailer";
import config from "../../config";

const accountSid = config.twillo_sid;
const authToken = config.twillo_auth;
const twilioPhoneNumber = config.twillo_number;
const client = twilio(accountSid, authToken);

const transporter = nodemailer.createTransport({
  host: config.smtp_host,
  port: 587,
  secure: false,
  auth: {
    user: config.smtp_user,
    pass: config.smtp_password,
  },
});

interface Otp {
  phone: string;
  email: string;
  otp: string;
  secret: string;
}

const generateOtp = async (req: Request, res: Response) => {
  const { phone, email } = req.body;

  const phoneOtp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const emailOtp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const secret = otpGenerator.generate(20, {
    digits: true,
    lowerCaseAlphabets: true,
    upperCaseAlphabets: true,
    specialChars: true,
  });

  const newOtp: Otp = {
    phone,
    email,
    phoneOtp,
    emailOtp,
    secret,
  } as any;

  try {
    const createdOtp = await OtpModel.create(newOtp);

    // Send OTP via SMS
    await client.messages.create({
      body: `ALIANZA SOLIDARIA: Esta información es solo para ti, no la compartas con terceros. ${phoneOtp} es el código de activación y verificación para tu cuenta en Alianza.`,
      from: twilioPhoneNumber,
      to: phone,
    });

    // Get current date and time in Colombian time zone
    const currentDate = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "America/Bogota",
      hour12: false,
    };
    const formattedDate = new Intl.DateTimeFormat("es-ES", options).format(
      currentDate
    );

    const mailOptions = {
      from: "rayhanalmim1@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${emailOtp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
            <img src="https://i.ibb.co/LS5F6XW/Picture1.jpg" alt="Company Logo" style="width: 100%; height: auto; display: block; margin-bottom: 20px; pointer-events: none;">
            <h1 style="font-weight: bold; color: #333;">Verificación y afiliación de tu cuenta.</h1>
            <p style="color: #666;">JUAN SEBASTIAN SAENZ TRINIDAD, utiliza la siguiente clave para confirmar y aceptar la verificación de tu cuenta en Alianza Solidaria de Ahorro y Crédito, la cual fue solicitada el jueves ${formattedDate}.</p>
            <div style="background-color: #ddd; padding: 10px; border-radius: 5px; margin-top: 10px; text-align: center;">
              <h1 style="margin: 0; color: #333;">${emailOtp}</h1>
            </div>
            <ul style="color: #666; margin-top: 20px;">
              <li>Recuerda que este código es personal e intransferible.</li>
              <li>Con la utilización de este código, declaras expresa e irrevocablemente haber leído, entendido y aceptado los términos y condiciones, declaraciones y autorizaciones y política de datos. De igual manera, declaras que conociste de manera previa, clara y completa todas las características y condiciones de verificación y afiliación de tu cuenta en Alianza Solidaria.</li>
              <li>Si no aceptas este producto o no estás realizando ningún proceso con nosotros, comunícate inmediatamente a nuestras líneas de atención llamando 315 779 2999 o escribiendo al Whatsapp 315 779 2999.</li>
              <li>Este código es válido para una única transacción.</li>
            </ul>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ secret: secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOtp = async (req: Request, res: Response) => {
  const { phone, email, otp } = req.body;

  try {
    const foundOtp = await OtpModel.findOne({ phone, email, otp });
    if (foundOtp) {
      res.json({ message: "OTP verified successfully" });
    } else {
      res.status(401).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const testData = async (req: Request, res: Response) => {
  const data = req.body;
};

export const OtpController = {
  generateOtp,
  verifyOtp,
};
