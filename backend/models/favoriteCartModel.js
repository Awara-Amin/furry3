// import mongoose from 'mongoose';

const mongoose = require("mongoose");
const favoriteCartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    favorateProducts: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: { type: String },
        image: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

favoriteCartSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
favoriteCartSchema.set("toJSON", {
  virtuals: true,
});

exports.Favcard = mongoose.model("Favcard", favoriteCartSchema);
