const express = require("express");
const productRouter = express.Router();
const User = require("../models/user");
const Item = require("../models/item");
const AppError = require("../utils/Error");

const ensureAuthenticated = (req, res, next) => {
  // This is the server-side check that CANNOT be bypassed by Redux edits
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Please login to perform the action" });
};

const productIdValidation = async (productId) => {
  //check for valid productid
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError("Invalid Product ID format", 400);
  }
  //check if product exists in db
  const productExists = await Item.findById(productId);
  if (!productExists) throw new AppError("Product not found", 404);
};

productRouter.post("/product-details", async (req, res, next) => {
  try {
    const itemId = req.body.productId;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new AppError("Invalid Product ID format", 400);
    }
    const productExists = await Item.findById(productId);
    if(!productExists){
        const item = await Item.create({
            itemId : productId,
            itemName : 
        })
    }
  } catch (err) {}
});

productRouter.post(
  "/set-price-alert",
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      // req.user comes from the SESSION, not the frontend.
      // This is secure.
      const userId = req.user.id;
      const { productId, targetPrice } = req.body;

      const user = await User.findById(userId);
      if (!user) throw new AppError("User not found", 404);

      //product validation
      await productIdValidation(productId);

      //check if user is already tracking that product
      const isAlreadyTracking = user.itemsTracking.some(
        (item) => item.itemId.toString() === productId,
      );

      if (isAlreadyTracking)
        throw new AppError("You are already tracking this item", 400);

      user.itemsTracking.push({ itemId: productId, targetPrice });
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
