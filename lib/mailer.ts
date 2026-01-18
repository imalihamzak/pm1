import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST ?? "softechinc.ai";
const smtpPort = Number(process.env.SMTP_PORT ?? "465");
const smtpUser = process.env.SMTP_USER ?? "noreply@softechinc.ai";
const smtpPass = process.env.SMTP_PASS ?? "y&S@!UoK83&S";

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  debug: true,
  logger: true,
});
