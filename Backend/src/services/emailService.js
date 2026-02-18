const brevo = require("@getbrevo/brevo");
const AppError = require("../utils/Error");

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY,
);

const sendPriceAlertEmail = async ({
  email,
  productName,
  targetPrice,
  currentPrice,
  productUrl,
}) => {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: "Price Ping",
    email: process.env.EMAIL_USER,
  };
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.subject = `Price Alert: ${productName} is now $${currentPrice}!`;
  sendSmtpEmail.htmlContent = `
    <h2>Price Drop Alert!</h2>
    <p>Good news! The product you're tracking has reached your target price.</p>
    <p><strong>Product:</strong> ${productName}</p>
    <p><strong>Your Target Price:</strong> $${targetPrice}</p>
    <p><strong>Current Price:</strong> $${currentPrice}</p>
    <p><a href="${productUrl}" style="display:inline-block; padding:10px 20px; background-color:#4CAF50; color:white; text-decoration:none; border-radius:5px;">View Product</a></p>
  `;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error("Email send failed:", error);
    throw new AppError("Failed to send email", 500);
  }
};

module.exports = { sendPriceAlertEmail };
