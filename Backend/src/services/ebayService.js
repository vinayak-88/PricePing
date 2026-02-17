const axios = require("axios");
const Item = require("../models/item");
const { getEbayToken } = require("./ebayAuth");
const AppError = require("../utils/Error");

const syncEbayProduct = async (ebayItemId) => {
  try {
    const token = await getEbayToken();

    // eBay RESTful Item ID format
    const resourceId = `v1|${ebayItemId}|0`;

    const response = await axios.get(
      `https://api.ebay.com/buy/browse/v1/item/${resourceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID": process.env.EBAY_MARKETPLACE_ID,
        },
      },
    );

    const { title, price, itemWebUrl, image } = response.data;
    const product = await Item.findOneAndUpdate(
      { itemId: ebayItemId },
      {
        itemName: title,
        itemUrl: itemWebUrl,
        itemPhoto: image?.imageUrl,
        $push: {
          priceHistory: { amount: parseFloat(price.value), date: new Date() },
        },
      },
      { upsert: true, new: true },
    );

    return product;
  } catch (error) {
    throw new AppError("PRODUCT_SYNC_FAILED", 400);
  }
};

module.exports = { syncEbayProduct };
