import nodemailer from "nodemailer";

export const sendGmailOrderEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // Gmail App Password
      },
    });

    const info = await transporter.sendMail({
      from: `ShopSage <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);

    return { success: true, info };
  } catch (error) {
    console.log("Email error:", error);
    return { success: false, error };
  }
};
