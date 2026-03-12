import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(to: string, code: string) {
  await transporter.sendMail({
    from: `"fayth.life" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your fayth.life verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7c3aed; margin-bottom: 8px;">fayth.life</h2>
        <p style="color: #374151; font-size: 14px;">Here is your verification code:</p>
        <div style="background: #f5f3ff; border: 2px solid #7c3aed; border-radius: 12px; padding: 20px; text-align: center; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7c3aed;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}
