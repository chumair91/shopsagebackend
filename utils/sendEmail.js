import Brevo from "@getbrevo/brevo";

export const sendEmail = async ({ to, subject, html }) => {
  const client = new Brevo.TransactionalEmailsApi();
  client.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );

  return await client.sendTransacEmail({
    sender: { name: "ShopSage", email: "umairkhalid2112@gmail.com" },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });
};
