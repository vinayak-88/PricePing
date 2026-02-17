const axios = require("axios");
const Item = require("../models/item");
const { getEbayToken } = require("./ebayAuth");
const AppError = require("../utils/Error");

const syncEbayProduct = async ({ iid, var_ }) => {
  try {
    const token = await getEbayToken();

    // eBay RESTful Item ID format
    const resourceId = `v1|${iid}|${var_ ?? 0}`;

    const response = await axios.get(
      `https://api.ebay.com/buy/browse/v1/item/${resourceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID": process.env.EBAY_MARKETPLACE_ID,
        },
      },
    );

    const { title, price, itemWebUrl, image, estimatedAvailabilities } =
      response.data;
    const itemId = var_ ? `${iid}-${var_}` : iid;

    const product = await Item.findOneAndUpdate(
      { itemId },
      {
        $set: {
          itemName: title,
          itemUrl: itemWebUrl,
          itemPhoto: image?.imageUrl,
          availability:
            estimatedAvailabilities?.[0]?.estimatedAvailabilityStatus ===
            "IN_STOCK",
        },
        $push: {
          priceHistory: { amount: parseFloat(price.value), date: new Date() },
        },
      },
      { upsert: true, new: true },
    );

    return product;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("PRODUCT_SYNC_FAILED", 400);
  }
};

module.exports = { syncEbayProduct };
