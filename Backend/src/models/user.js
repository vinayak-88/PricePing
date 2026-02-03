const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  authId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    minlength: 1,
    maxlength: 100,
    trim: true,
  },
  emailId: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid email address: " + value);
      }
    },
  },
  itemsTracking: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
      targetPrice: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
