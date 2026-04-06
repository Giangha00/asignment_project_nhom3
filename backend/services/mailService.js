const nodemailer = require("nodemailer");

function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter;

function getTransporter() {
  if (!isMailConfigured()) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

function otpTypeLabel(otpType) {
  if (otpType === "change_password") return "xác nhận đổi mật khẩu";
  if (otpType === "reset_password") return "đặt lại mật khẩu";
  if (otpType === "verify_email") return "xác minh email";
  return "ứng dụng";
}

async function sendOtpEmail({ to, code, otpType }) {
  const tx = getTransporter();
  if (!tx) {
    const err = new Error("SMTP chưa cấu hình (thiếu SMTP_HOST / SMTP_USER / SMTP_PASS)");
    err.code = "MAIL_NOT_CONFIGURED";
    throw err;
  }

  const fromName = process.env.MAIL_FROM_NAME || "Assignment App";
  const fromAddr = process.env.MAIL_FROM || process.env.SMTP_USER;
  const from = `"${fromName}" <${fromAddr}>`;
  const purpose = otpTypeLabel(otpType);

  const text = `Mã OTP của bạn (${purpose}): ${code}\nMã có hiệu lực trong 15 phút. Không chia sẻ mã này với ai.`;
  const html = `
    <p>Mã OTP của bạn <strong>(${purpose})</strong>:</p>
    <p style="font-size:24px;letter-spacing:4px;font-weight:bold;">${code}</p>
    <p>Mã có hiệu lực trong <strong>15 phút</strong>.</p>
    <p>Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email.</p>
  `;

  await tx.sendMail({
    from,
    to,
    subject: `[OTP] Mã xác thực — ${purpose}`,
    text,
    html,
  });
}

module.exports = { isMailConfigured, sendOtpEmail, getTransporter };
