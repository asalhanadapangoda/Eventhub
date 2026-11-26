import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer transport using environment variables
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  const cleanUser = user.trim();
  const cleanPass = pass.trim().replace(/\s+/g, ''); // Automatically strips spaces if copied from Google App Password

  // Use native Gmail service if sending from a Gmail account
  if (cleanUser.includes('@gmail.com') || host.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: cleanUser,
        pass: cleanPass,
      },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: cleanUser,
      pass: cleanPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Generic email notification sender
 */
export const sendEmailNotification = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : null;
  const from = process.env.SMTP_FROM || (user ? `"TRACE Sri Lanka" <${user}>` : '"TRACE Sri Lanka" <projects@trace.lk>');

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text: text || html?.replace(/<[^>]*>/g, ''),
      });
      console.log(`[Email Service] Dispatched live email to ${to} with subject: "${subject}" (MessageId: ${info.messageId})`);
      return { success: true, mode: 'live', recipient: to, messageId: info.messageId };
    } catch (err) {
      console.error(`[Email Service ERROR] Failed to send email to ${to}:`, err.message);
      return { success: false, mode: 'error', error: err.message };
    }
  }

  // Graceful development / demo logger
  console.log('---------------------------------------------------------');
  console.log(`[TRACE Notification System - Mock Email Dispatched]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${text || html?.substring(0, 150)}...`);
  console.log('---------------------------------------------------------');

  return { success: true, mode: 'mock', recipient: to };
};

/**
 * Send program registration email
 */
export const sendProgramRegistrationEmail = async (registration, program) => {
  const subject = `Registration Confirmed: ${program.title} | TRACE Sri Lanka`;
  const html = `
    <h2>Welcome to TRACE Innovation Academy</h2>
    <p>Dear ${registration.fullName},</p>
    <p>Your registration for <strong>${program.title}</strong> has been successfully received and approved.</p>
    <p><strong>Your Registration Reference Number:</strong> ${registration.referenceNumber}</p>
    <p><strong>What Happens Next:</strong></p>
    <ul>
      <li>You now have automatic access to all upcoming workshops under ${program.title}.</li>
      <li>Log in to your TRACE Participant Dashboard to view session agendas, Google Meet / Zoom links, and physical lab access instructions at Bay 05, Maradana.</li>
    </ul>
    <p>Best regards,<br/>Dilshan Perera<br/>Head of Programs & Incubation<br/>TRACE Expert City, Sri Lanka</p>
  `;
  return sendEmailNotification({
    to: registration.email,
    subject,
    html,
    text: `Your registration for ${program.title} is confirmed. Ref: ${registration.referenceNumber}. You have automatic access to all workshops.`,
  });
};

/**
 * Send visit request confirmation email
 */
export const sendVisitRequestEmail = async (visitRequest) => {
  const subject = `Industry Visit Request Received: Ref #${visitRequest.referenceNumber} | TRACE Expert City`;
  const html = `
    <h2>TRACE Expert City - Industry Visit Application</h2>
    <p>Dear ${visitRequest.contactPerson},</p>
    <p>We have received your industry visit request for <strong>${visitRequest.organizationName}</strong>.</p>
    <p><strong>Reference Number:</strong> ${visitRequest.referenceNumber}</p>
    <p><strong>Proposed Date:</strong> ${visitRequest.preferredVisitDate} (${visitRequest.preferredTime})</p>
    <p><strong>Number of Participants:</strong> ${visitRequest.numberOfParticipants} (${visitRequest.participantAgeGroup})</p>
    <p>Our Secretariat is reviewing your request and will confirm scheduling shortly.</p>
    <p>TRACE Expert City Secretariat<br/>Bay 05, Tripoli Market, Maradana, Colombo 10</p>
  `;
  return sendEmailNotification({
    to: visitRequest.email,
    subject,
    html,
    text: `Your visit request for ${visitRequest.organizationName} has been received. Reference: ${visitRequest.referenceNumber}.`,
  });
};

/**
 * Send password reset verification code email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - Recipient full name
 * @param {string} options.code - 6-digit OTP code
 */
export const sendPasswordResetEmail = async ({ to, name, code }) => {
  const transporter = createTransporter();
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : null;
  const from = process.env.SMTP_FROM || (user ? `"TRACE Sri Lanka" <${user}>` : '"TRACE Sri Lanka" <projects@trace.lk>');
  const subject = `Your TRACE Academy Password Reset Code: ${code}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - TRACE Sri Lanka</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #0B192C; padding: 28px 32px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: 0.5px;">
                      TRACE SRI LANKA
                    </h1>
                    <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">
                      Innovation Academy Portal
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px 32px 24px;">
                    <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0 0 12px;">
                      Password Reset Request
                    </h2>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                      Hello <strong>${name || 'Participant'}</strong>,<br/>
                      We received a request to reset the password for your TRACE Innovation Academy account associated with <strong>${to}</strong>.
                    </p>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                      Please use the following 6-digit verification code to complete your password reset:
                    </p>

                    <!-- OTP Code Box -->
                    <div style="background-color: #f8fafc; border: 2px dashed #006398; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                      <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #006398; font-family: monospace;">
                        ${code}
                      </span>
                    </div>

                    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 16px;">
                      ⏱ This code is valid for <strong>15 minutes</strong>. For your security, never share this code with anyone.
                    </p>
                    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
                      If you did not request a password reset, you can safely ignore this email. Your existing password will remain unchanged.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
                    <p style="color: #64748b; font-size: 11px; margin: 0 0 4px;">
                      TRACE Expert City, Bay 05, Tripoli Market, Maradana, Colombo 10, Sri Lanka
                    </p>
                    <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                      &copy; ${new Date().getFullYear()} TRACE Sri Lanka Innovation Academy. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text: `Hello ${name || 'User'},\n\nYour TRACE Innovation Academy password reset code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.`,
      });
      console.log(`[SMTP] Password reset email sent successfully to ${to}. MessageId: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[SMTP ERROR] Failed to send email to ${to}:`, err.message);
      return {
        sent: false,
        error: `Email delivery failed: ${err.message}. Please check your SMTP settings in server/.env.`,
      };
    }
  } else {
    console.warn(`[SMTP NOTICE] SMTP credentials not configured in server/.env. Cannot send live email.`);
    return {
      sent: false,
      error: 'SMTP email credentials are not configured in server/.env. Please set SMTP_USER and SMTP_PASS (e.g. Gmail App Password).',
    };
  }
};
