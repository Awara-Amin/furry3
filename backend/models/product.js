const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  { timestamps: true }
);

const sellingProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: {
      type: String,
      default: "",
    },
    rating: { type: Number, required: true },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  richDescription: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  images: [
    {
      type: String,
    },
  ],
  brand: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0,
  },

  discount: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  countInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  numReviews: {
    type: Number,
    required: true,
  },
  reviews: [reviewSchema],
  bestSellingProducts: [sellingProductSchema],
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
productSchema.set("toJSON", {
  virtuals: true,
});

exports.Product = mongoose.model("Product", productSchema);

// const mongoose = require("mongoose");

// const productSchema = mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
//   richDescription: {
//     type: String,
//     default: "",
//   },
//   image: {
//     type: String,
//     default: "",
//   },
//   images: [
//     {
//       type: String,
//     },
//   ],
//   brand: {
//     type: String,
//     default: "",
//   },
//   price: {
//     type: Number,
//     default: 0,
//   },
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Category",
//     required: true,
//   },
//   countInStock: {
//     type: Number,
//     required: true,
//     min: 0,
//     max: 255,
//   },
//   rating: {
//     type: Number,
//     default: 0,
//   },
//   numReviews: {
//     type: Number,
//     default: 0,
//   },
//   isFeatured: {
//     type: Boolean,
//     default: false,
//   },
//   dateCreated: {
//     type: Date,
//     default: Date.now,
//   },
// });

// productSchema.virtual("id").get(function () {
//   return this._id.toHexString();
// });
// productSchema.set("toJSON", {
//   virtuals: true,
// });

// exports.Product = mongoose.model("Product", productSchema);
