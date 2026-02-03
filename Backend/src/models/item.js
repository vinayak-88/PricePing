const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
    index: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  priceHistory: [
    {
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
    },
  ],
  itemUrl: {
    type : String,
    required : true
  },
  itemPhoto : {
    type : String,
    default : process.env.DEFAULT_ITEM_PIC_URL
  },
  availability : {
    type : Boolean,
    default : false
  }
});

module.exports = mongoose.model("Item", itemSchema);
