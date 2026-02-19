const cron = require("node-cron");
const Item = require("../models/item");
const User = require("../models/user");
const { syncEbayProduct } = require("./ebayService");
const { extractEbayIds } = require("../utils/ebay");
const { sendPriceAlertEmail } = require("./emailService");

const syncAllProducts = async () => {
  const items = await Item.find({});
  // Load ALL users who are tracking anything — one single query
  const allUsers = await User.find({ "itemsTracking.0": { $exists: true } });

  for (const item of items) {
    try {
      const { iid, var_ } = extractEbayIds(item.itemUrl);
      const updatedProduct = await syncEbayProduct({ iid, var_ });

      const latestPrice =
        updatedProduct.priceHistory[updatedProduct.priceHistory.length - 1]
          .amount;

      // find relevant users tracking this product
      const relevantUsers = allUsers.filter((user) =>
        user.itemsTracking.some((t) => t.itemId === item.itemId),
      );

      // check each user's target price and send email
      for (const user of relevantUsers) {
        const tracking = user.itemsTracking.find(
          (t) => t.itemId === item.itemId,
        );

        const ALERT_THRESHOLD = 0.05; // 5% further drop triggers a new alert

        if (latestPrice <= tracking.targetPrice) {
          const lastAlerted = tracking.lastAlertedPrice;

          const shouldAlert =
            lastAlerted === null || // never alerted before
            latestPrice <= lastAlerted * (1 - ALERT_THRESHOLD); // dropped 5% more since last alert

          if (shouldAlert) {
            await sendPriceAlertEmail({
              email: user.emailId,
              productName: updatedProduct.itemName,
              targetPrice: tracking.targetPrice,
              currentPrice: latestPrice,
              productUrl: updatedProduct.itemUrl,
            });
            tracking.lastAlertedPrice = latestPrice;
            await user.save();
          }
        } else {
          // price went back above target, reset so next drop triggers fresh alert
          if (tracking.lastAlertedPrice !== null) {
            tracking.lastAlertedPrice = null;
            await user.save();
          }
        }
      }
    } catch (error) {
      console.error(`[CRON] Failed to sync ${item.itemId}:`, error.message);
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
