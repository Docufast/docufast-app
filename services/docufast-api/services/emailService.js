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

export async function sendQuoteEmail(toEmail, serviceLabel, amount, orderRef) {
  const formattedAmount = Number(amount).toLocaleString("en-NG");

  const msg = {
    to: toEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: `Your Docufast quote is ready — ${serviceLabel}`,
    text: `Your quote for ${serviceLabel} (${orderRef}) is ready: ₦${formattedAmount}. Sign in to your Docufast account to review and pay.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #013B65;">Your quote is ready</h2>
        <p><strong>${serviceLabel}</strong> (${orderRef})</p>
        <p style="font-size: 24px; font-weight: bold; color: #013B65;">₦${formattedAmount}</p>
        <p>Sign in to your Docufast account to review this quote and continue.</p>
        <p style="color: #666; font-size: 13px;">No payment has been taken yet — you'll confirm before anything is charged.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    return { success: false, error: error.response?.body || error.message };
  }
}
