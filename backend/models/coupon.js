const mongoose = require("mongoose");

const couponSchema = mongoose.Schema({
  discount: {
    type: Number,
    required: true,
  },

  total: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  couponMessage: {
    type: String,
    default: "Coongratulation you have got discount",
  },
  // awara
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

couponSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
couponSchema.set("toJSON", {
  virtuals: true,
});

exports.Coupon = mongoose.model("Coupon", couponSchema);
