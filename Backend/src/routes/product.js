const express = require("express");
const mongoose = require("mongoose");
const productRouter = express.Router();
const User = require("../models/user");
const Item = require("../models/item");
const AppError = require("../utils/Error");
const { syncEbayProduct } = require("../services/ebayService");
const { validateUrl, extractEbayIds } = require("../utils/ebay");

//utility middleware
const ensureAuthenticated = (req, res, next) => {
  // This is the server-side check that CANNOT be bypassed by Redux edits
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Please login to perform the action" });
};

//routes
productRouter.get("/get-history", async (req, res, next) => {
  try {
    const { rawUrl } = req.query;
    validateUrl(rawUrl);
    const { iid, var_ } = extractEbayIds(rawUrl);
    const itemId = var_ ? `${iid}-${var_}` : iid;

    let product = await Item.findOne({ itemId });
    if (!product) {
      product = await syncEbayProduct({ iid, var_ });
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err); // Passes to your error handler
  }
});

productRouter.post(
  "/set-price-alert",
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      // req.user comes from the SESSION, not the frontend.
      const userId = req.user.id;
      const { rawUrl, targetPrice } = req.body;

      const user = await User.findById(userId);
      if (!user) throw new AppError("User not found", 404);

      //url validation and productid formation

      validateUrl(rawUrl);
      const { iid, var_ } = extractEbayIds(rawUrl);
      const itemId = var_ ? `${iid}-${var_}` : iid;

      let product = await Item.findOne({ itemId });
      if (!product) {
        product = await syncEbayProduct({ iid, var_ });
      }

      //check if user is already tracking that product
      const isAlreadyTracking = user.itemsTracking.some(
        (item) => item.itemId === itemId,
      );

      if (isAlreadyTracking)
        throw new AppError("You are already tracking this item", 400);

      user.itemsTracking.push({ itemId, targetPrice });
      await user.save();
      res.status(200).json({
        success: true,
        message: `Alert set for ${user.emailId}`, // Use the actual user object property
      });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = productRouter;
