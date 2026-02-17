const axios = require('axios');
const AppError = require('../utils/Error');

const getEbayToken = async () => {
  // eBay requires a Base64 encoded string of ClientID:ClientSecret
  const authHeader = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.post(
      'https://api.ebay.com/identity/v1/oauth2/token',
      'grant_type=client_credentials&scope=https://api.ebay.com/oauthapi/scope/buy.item.bulk',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authHeader}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    throw new AppError('FAILED_TO_AUTHENTICATE_WITH_EBAY', 400);
  }
};

module.exports = { getEbayToken };