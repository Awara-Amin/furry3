const express = require("express");
const { Coupon } = require("../models/coupon");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const console = require("console");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  const couponList = await Coupon.find();
  if (!couponList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(couponList);
});

// router.get(`/`, async (req, res) => {
//     // localhost:3000/api/v1/products?categories=123445,234567    >v40
//     let filter = {}; // when it is empty we get all
//     //but when there are/is query we get based on the query
//     if (req.query.categories) {
//       filter = { category: req.query.categories.split(",") };
//     }
//     // const productList = await Product.find({ category: [] }).populate("category");
//     const productList = await Product.find(filter).populate("category");

//     if (!productList) {
//       res.status(500).json({ success: false });
//     }
//     res.send(productList);
//   });

// router.get(`/`, async (req, res) => {
//   const categoryList = await Category.find();
//   if (!categoryList) {
//     res.status(500).json({ success: false });
//   }
//   res.status(200).send(categoryList);
// });

// router.get("/:id", async (req, res) => {
//   const category = await Category.findById(req.params.id);

//   if (!category) {
//     res
//       .status(500)
//       .json({ message: "the category with the given id was not found" });
//   }
//   res.status(200).send(category);
// });

// router.post(`${api}/products`, (req, res) => {
router.put("/:id", uploadOptions.none(), async (req, res) => {
  // console.log("wtaht is coupon tttttttttttttttttttt todayyyyy-1");
  // console.log(req.body.discount);
  // console.log(req.body.isActive);

  // in this case API will return error if we pass wrong id
  // mongoose.isValidObjectId(req.params.id);
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product Id");
  }

  //   const category = await Category.findById(req.body.category);
  //   if (!category) return res.status(400).send("Invalid Category");

  const coupon = await Coupon.findById(req.params.id);
  // console.log("wtaht is coupon tttttttttttttttttttt");
  // console.log(coupon);

  if (!coupon) return res.status(400).send("Invalid Coupon shekh!");

  //   const file = req.file;
  //   console.log("wtaht is fileeeeeeeeeeeee");
  //   console.log(file);
  //   let imagepath;

  //   if (file) {
  //     const fileName = file.filename;
  //     const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  //     imagepath = `${basePath}${fileName}`;
  //   } else {
  //     imagepath = product.image;
  //   }

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    {
      discount: req.body.discount,
      total: req.body.total,
      isActive: req.body.isActive,
      //   description: req.body.description,
      //   richDescription: req.body.richDescription,
      // image: req.body.image,
      //   image: imagepath,
      // images: req.body.Images,
      //   brand: req.body.brand,
      //   price: req.body.price,
      //   discount: req.body.discount,
      //   category: req.body.category,
      //   countInStock: req.body.countInStock,
      //   rating: req.body.rating,
      //   numReviews: req.body.numReviews,
      //   isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!updatedCoupon)
    return res.status(500).send("the coupon can not be created");
  res.send(updatedCoupon);
});

router.post(`/`, uploadOptions.none(), async (req, res) => {
  //   const category = await Category.findById(req.body.category);
  //   if (!category) return res.status(400).send("Invalid Category");

  //   const file = req.file;
  //   console.log("wtaht is fileeeeeeeeeeeee");
  //   console.log(file);
  //   if (!file) return res.status(400).send("No image in the request");

  //   const fileName = file.filename;
  //   const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  let coupon = new Coupon({
    discount: req.body.discount,
    total: req.body.total,
    // name: req.body.name,
    // description: req.body.description,
    // richDescription: req.body.richDescription,
    // image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
    // images: [],
    // brand: req.body.brand,
    // price: req.body.price,
    // discount: req.body.discount,
    // category: req.body.category,
    // countInStock: req.body.countInStock,
    // rating: req.body.rating,
    // numReviews: req.body.numReviews,
    // isFeatured: req.body.isFeatured,
    // numReviews: 0,
  });

  //   product = await product.save();
  coupon = await coupon.save();

  if (!coupon) return res.status(500).send("The coupon can not be created");

  res.send(coupon);
});

router.delete("/:id", (req, res) => {
  Coupon.findByIdAndRemove(req.params.id)
    .then((coupon) => {
      if (coupon) {
        return res
          .status(200)
          .json({ success: true, message: "The coupon is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "coupon was not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});
// router.post("/", async (req, res) => {
//   let category = new Category({
//     name: req.body.name,
//     icon: req.body.icon,
//     color: req.body.color,
//   });

//   category = await category.save();
//   if (!category) return res.status(404).send("the category can not be created");

//   res.send(category);
// });

// router.put("/:id", async (req, res) => {
//   const category = await Category.findByIdAndUpdate(
//     req.params.id,
//     {
//       name: req.body.name,
//       icon: req.body.icon,
//       color: req.body.color,
//     },
//     { new: true }
//   );

//   if (!category) return res.status(404).send("the category can not be created");
//   res.send(category);
// });

// the URL it would be like that> api/v1/whateverYouWant(let say id)
// router.delete("/:id", (req, res) => {
//   Category.findByIdAndRemove(req.params.id)
//     .then((category) => {
//       if (category) {
//         return res
//           .status(200)
//           .json({ success: true, message: "The category is deleted" });
//       } else {
//         return res
//           .status(404)
//           .json({ success: false, message: "Category was not found" });
//       }
//     })
//     .catch((err) => {
//       return res.status(400).json({ success: false, error: err });
//     });
// });

module.exports = router;
