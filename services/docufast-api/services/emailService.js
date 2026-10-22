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

// Payment receipt (#109). Sent once, when an order is first marked paid.
export async function sendPaymentReceiptEmail(toEmail, { orderRef, orderType, amountNaira, reference, paidAt }) {
  const formattedAmount = Number(amountNaira).toLocaleString("en-NG");
  const service = String(orderType || "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const when = new Date(paidAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" });

  const msg = {
    to: toEmail,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Payment received: ${service} (${orderRef})`,
    text: `We have received your payment of NGN ${formattedAmount} for ${service} (${orderRef}). Payment reference: ${reference}. Paid: ${when} (Lagos time). Your order is now being processed; follow it in your Docufast account. Docufast Integrated Services Ltd, RC 1893484. Prices include VAT.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0D0D0D;">Payment received</h2>
        <p><strong>${service}</strong> (${orderRef})</p>
        <p style="font-size: 24px; font-weight: bold; color: #0D0D0D;">₦${formattedAmount}</p>
        <p>Payment reference: ${reference}<br/>Paid: ${when} (Lagos time)</p>
        <p>Your order is now being processed. You can follow every step in your Docufast account.</p>
        <p style="color: #666; font-size: 13px;">Docufast Integrated Services Ltd, RC 1893484. Prices include VAT. Pay only on docufast.ng.</p>
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

// Express fee refund (Terms section 7). Sent when Paystack accepts the refund.
export async function sendExpressRefundEmail(toEmail, { orderRef, amountNaira }) {
  const formattedAmount = Number(amountNaira).toLocaleString("en-NG");
  const msg = {
    to: toEmail,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Express fee refunded (${orderRef})`,
    text: `We missed the Express delivery time for your order ${orderRef}, so we have refunded the Express fee of NGN ${formattedAmount} to your original payment method. Refunds usually arrive within 3 to 5 working days. We are sorry for the delay. Your order is still being completed and you can follow it in your Docufast account. Questions: support@docufast.ng or WhatsApp 0905 495 1918.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0D0D0D;">Express fee refunded</h2>
        <p>We missed the Express delivery time for your order <strong>${orderRef}</strong>, so we have refunded the Express fee.</p>
        <p style="font-size: 24px; font-weight: bold; color: #0D0D0D;">₦${formattedAmount}</p>
        <p>It goes back to your original payment method, usually within 3 to 5 working days. We are sorry for the delay.</p>
        <p>Your order is still being completed. You can follow it in your Docufast account.</p>
        <p style="color: #666; font-size: 13px;">Questions: support@docufast.ng or WhatsApp 0905 495 1918. Docufast Integrated Services Ltd, RC 1893484.</p>
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
