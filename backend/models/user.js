const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // BENAWA for e-comerce mobile
    // required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  street: {
    type: String,
    default: "",
  },
  apartment: {
    type: String,
    default: "",
  },
  zip: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  seenNotifications: {
    type: Array,
    default: [],
  },
  unseenNotifications: {
    type: Array,
    default: [],
  },
  isCouponGiven: {
    type: Boolean,
    default: false,
  },
  // seenNotificationsByAdmin: {
  //   type: Array,
  //   default: [],
  // },
  // unseenNotificationsByAdmin: {
  //   type: Array,
  //   default: [],
  // },
  // awara
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

// to get virtual id not this _id
userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
userSchema.set("toJSON", {
  virtuals: true,
});
exports.User = mongoose.model("User", userSchema);
