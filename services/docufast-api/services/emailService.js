import dotenv from "dotenv";
dotenv.config();

import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = "docufastng@gmail.com";
const FROM_NAME = "Docufast";

export async function sendTestEmail(toEmail) {
  const msg = {
    to: toEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: "Docufast — Test Email",
    text: "This is a test email from Docufast. If you're reading this, SendGrid is working correctly.",
    html: "<p>This is a test email from Docufast. If you're reading this, SendGrid is working correctly.</p>",
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    return { success: false, error: error.response?.body || error.message };
  }
}