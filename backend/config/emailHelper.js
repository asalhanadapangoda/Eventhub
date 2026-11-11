const nodemailer = require("nodemailer");

/**
 * Send Email Notification helper using configured Gmail SMTP or Ethereal fallback
 * @param {Object} options { to, subject, html, replyTo }
 */
const sendEmail = async ({ to, subject, html, replyTo }) => {
  try {
    let transporter;
    const cleanUser = (process.env.EMAIL_USER || "").trim();
    const cleanPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();

    const isRealConfigured =
      cleanUser &&
      cleanPass &&
      !cleanUser.includes("your_gmail_address");

    if (isRealConfigured) {
      console.log(`[SMTP] Dispatching email to: ${to} | Subject: ${subject}`);
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587", 10),
        secure: false, // 587 uses STARTTLS
        auth: {
          user: cleanUser,
          pass: cleanPass,
        },
      });
    } else {
      console.log(`[SMTP Test] Dispatching test email via Ethereal to: ${to}`);
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: `"TRACE Event Hub" <${process.env.EMAIL_USER || "admin@trace.lk"}>`,
      to,
      subject,
      html,
    };

    if (replyTo) {
      mailOptions.replyTo = replyTo;
    }

    const info = await transporter.sendMail(mailOptions);

    if (!isRealConfigured) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`Preview Email URL: ${previewUrl}`);
      return { success: true, previewUrl };
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[SMTP Error] Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
