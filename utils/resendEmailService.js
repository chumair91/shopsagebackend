import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// send email function
export const sendOrderEmail = async (to, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: "ShopSage <onboarding@resend.dev>", // safe sender
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.log("Email error:", error);
    return { success: false, error };
  }
};
