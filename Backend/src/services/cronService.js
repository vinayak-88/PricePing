const cron = require("node-cron");
const Item = require("../models/item");
const User = require("../models/user");
const { syncEbayProduct } = require("./ebayService");
const { extractEbayIds } = require("../utils/ebay");
const { sendPriceAlertEmail } = require("./emailService");

const syncAllProducts = async () => {
  const items = await Item.find({});
  let succeeded = 0;
  let failed = 0;

  for (const item of items) {
    try {
      const { iid, var_ } = extractEbayIds(item.itemUrl);
      const updatedProduct = await syncEbayProduct({ iid, var_ });
      succeeded++;

      const latestPrice =
        updatedProduct.priceHistory[updatedProduct.priceHistory.length - 1]
          .amount;

      // find users tracking this product
      const users = await User.find({
        "itemsTracking.itemId": item.itemId,
      });

      // check each user's target price and send email
      for (const user of users) {
        const tracking = user.itemsTracking.find(
          (t) => t.itemId === item.itemId,
        );

        if (tracking && latestPrice <= tracking.targetPrice) {
          await sendPriceAlertEmail({
            email: user.emailId,
            productName: updatedProduct.itemName,
            targetPrice: tracking.targetPrice,
            currentPrice: latestPrice,
            productUrl: updatedProduct.itemUrl,
          });
        }
      }
    } catch (error) {
      console.error(`[CRON] Failed to sync ${item.itemId}:`, error.message);
      failed++;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

const startCronJobs = () => {
  // runs every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    try {
      await syncAllProducts();
    } catch (error) {
      console.error("[CRON] Sync failed:", error.message);
    }
  });
};

module.exports = { startCronJobs };
