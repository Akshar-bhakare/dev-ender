import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[STUB EMAIL] To: ${to} | Subject: ${subject} | HTML: ${html}`);
    return;
  }

  const from = process.env.FROM_EMAIL || 'no-reply@syncup.io';

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw for hackathon stability, but log it
  }
};
